/**
 * Happy Sun - Button & interaction handlers
 */

var API_BASE = 'https://ubwyrwtkcc.execute-api.ap-southeast-2.amazonaws.com/dev1';
var QUIZ_ENDPOINT = '/sunChampion';

(function () {
  'use strict';

  // default coordinates (Melbourne)
  var DEFAULT_LAT = -37.8136;
  var DEFAULT_LON = 144.9631;

  function fetchClothingData(lat, lon) {
    fetch(API_BASE + '/clothing-recommendation?lat=' + lat + '&lon=' + lon)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch clothing data: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        console.log('Clothing API response:', data);

        var parsed = data;
        if (typeof data.body === 'string') {
          parsed = JSON.parse(data.body);
        }

        document.getElementById('uvValue').textContent = parsed.uv_index;
        document.getElementById('riskValue').textContent =
          'Risk category: ' + parsed.risk_level;

        document.getElementById('tempValue').textContent =
          parsed.temperature + ' °C';

        document.getElementById('conditionValue').textContent =
          'Conditions: ' + parsed.condition;

        // Update materials list
        var materialsEl = document.getElementById('materialsList');
        if (materialsEl && Array.isArray(parsed.clothing_materials)) {
          materialsEl.innerHTML = '';
          parsed.clothing_materials.forEach(function (material) {
            var li = document.createElement('li');
            li.textContent = material;
            materialsEl.appendChild(li);
          });
        }

        // Update recommended items list
        var itemsEl = document.getElementById('itemsList');
        if (itemsEl && Array.isArray(parsed.recommended_items)) {
          itemsEl.innerHTML = '';
          parsed.recommended_items.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            itemsEl.appendChild(li);
          });
        }

        // Update explanation text
        var explanationEl = document.getElementById('explanationText');
        if (explanationEl && parsed.explanation) {
          explanationEl.textContent = parsed.explanation;
        }
      })
      .catch(function (error) {
        console.error('Failed to fetch clothing recommendation:', error);
      });
  }

  function onGetUvIndex() {
    var locationInput = document.getElementById('locationInput');
    var query = locationInput ? locationInput.value.trim() : '';

    if (!query) {
      // No input, use default Melbourne coordinates
      fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    // Use Open-Meteo Geocoding API to convert city name to coordinates
    var geocodeUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=1&language=en&format=json';

    fetch(geocodeUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Geocoding failed: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        if (data.results && data.results.length > 0) {
          var result = data.results[0];
          console.log('Geocoded location:', result.name, result.latitude, result.longitude);
          fetchClothingData(result.latitude, result.longitude);
        } else {
          console.warn('Location not found, using default');
          alert('Location "' + query + '" not found. Using default location.');
          fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
        }
      })
      .catch(function (error) {
        console.error('Geocoding error:', error);
        alert('Failed to find location. Using default location.');
        fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
      });
  }

  function autoLocateAndFetch() {
    var locationInput = document.getElementById('locationInput');

    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location');
      if (locationInput) {
        locationInput.placeholder = 'Using default: Melbourne (location unavailable)';
      }
      fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log('User location:', lat, lon);
        if (locationInput) {
          locationInput.placeholder = 'Using your current location';
        }
        fetchClothingData(lat, lon);
      },
      function (error) {
        console.warn('Geolocation error:', error.message);
        console.log('Using default location');
        if (locationInput) {
          locationInput.placeholder = 'Using default: Melbourne (location access denied)';
        }
        fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  function fetchQuizTips(lat, lon) {

    fetch(API_BASE + '/sunChampion?lat=' + lat + '&lon=' + lon)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch quiz data: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {

        console.log("Quiz API response:", data);

        var parsed = data;
        if (typeof data.body === 'string') {
          parsed = JSON.parse(data.body);
        }

        var checklistEl = document.getElementById("quiz-checklist");
        var statusEl = document.getElementById("quiz-status");

        if (!checklistEl) return;

        checklistEl.innerHTML = "";

        if (statusEl) {
          statusEl.textContent =
            "UV Index " + parsed.uv_index + " • " + parsed.risk_level + " risk";
        }

        parsed.tips.forEach(function (tip, index) {

          var label = document.createElement("label");
          label.className = "quiz-item";

          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "quiz-checkbox";

          var span = document.createElement("span");
          span.textContent = tip;

          checkbox.addEventListener("change", checkQuizCompletion);

          label.appendChild(checkbox);
          label.appendChild(span);

          checklistEl.appendChild(label);
        });

      })
      .catch(function (error) {
        console.error("Quiz fetch error:", error);

        var statusEl = document.getElementById("quiz-status");
        if (statusEl) {
          statusEl.textContent = "Could not load sun safety checklist.";
        }
      });
  }

  function checkQuizCompletion() {

    var checkboxes = document.querySelectorAll(".quiz-checkbox");
    var button = document.getElementById("quiz-complete-btn");

    if (!checkboxes.length || !button) return;

    var allChecked = true;

    checkboxes.forEach(function (box) {
      if (!box.checked) {
        allChecked = false;
      }
    });

    button.disabled = !allChecked;
  }

  function completeQuiz() {

    var resultEl = document.getElementById("quiz-result");
    var celebration = document.getElementById("quiz-celebration");

    if (resultEl) {
      resultEl.textContent =
        "Congratulations! You are a Sun Champion today!";
    }

    if (celebration) {
      celebration.style.display = "block";
    }
  }

  function fetchSunscreenData(lat, lon, isDefault) {
    fetch(API_BASE + '/sunscreen-dosage?lat=' + lat + '&lon=' + lon)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch sunscreen data: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        console.log('Sunscreen API response:', data);

        var parsed = data;
        if (typeof data.body === 'string') {
          parsed = JSON.parse(data.body);
        }

        var uvBadge = document.getElementById('sunscreen-uv-badge');
        if (uvBadge) {
          uvBadge.textContent = parsed.uv_index + ' ' + parsed.risk_level;
          var riskClass = parsed.risk_level.toLowerCase().replace(' ', '-');
          uvBadge.className = 'uv-badge ' + riskClass;
        }

        var locationEl = document.getElementById('sunscreen-location');
        if (locationEl && !isDefault) {
          locationEl.textContent = 'Based on your current location • ' + parsed.risk_level + ' risk';
        }

        var descEl = document.getElementById('sunscreen-description');
        if (descEl) {
          descEl.textContent = parsed.protection_explanation;
        }

        var amountEl = document.getElementById('sunscreen-amount');
        if (amountEl && parsed.dosage) {
          amountEl.textContent = parsed.dosage.tsp + ' tsp / ' + parsed.dosage.pumps + ' pumps';
        }

        var reapplyEl = document.getElementById('sunscreen-reapply');
        if (reapplyEl && parsed.dosage) {
          reapplyEl.textContent = 'Every ' + parsed.dosage.reapply_minutes + ' minutes';
        }

        var guidanceEl = document.getElementById('sunscreen-guidance');
        if (guidanceEl && Array.isArray(parsed.guidance)) {
          guidanceEl.innerHTML = '';
          parsed.guidance.forEach(function (tip) {
            var li = document.createElement('li');
            li.textContent = tip;
            guidanceEl.appendChild(li);
          });
        }
      })
      .catch(function (error) {
        console.error('Failed to fetch sunscreen data:', error);
        var descEl = document.getElementById('sunscreen-description');
        if (descEl) {
          descEl.textContent = 'Could not load sunscreen recommendation. Please try again later.';
        }
      });
  }

  function autoLocateAndFetchSunscreen() {
    var locationEl = document.getElementById('sunscreen-location');

    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location for sunscreen');
      if (locationEl) {
        locationEl.textContent = 'Using default location: Melbourne (location unavailable)';
      }
      fetchSunscreenData(DEFAULT_LAT, DEFAULT_LON, true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log('User location for sunscreen:', lat, lon);
        fetchSunscreenData(lat, lon, false);
      },
      function (error) {
        console.warn('Geolocation error for sunscreen:', error.message);
        if (locationEl) {
          locationEl.textContent = 'Using default location: Melbourne (location access denied)';
        }
        fetchSunscreenData(DEFAULT_LAT, DEFAULT_LON, true);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  function fetchUvTrackerData(lat, lon, isDefault) {
    // Use the same API as clothing to get UV data
    fetch(API_BASE + '/clothing-recommendation?lat=' + lat + '&lon=' + lon)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch UV data: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        console.log('UV Tracker API response:', data);

        var parsed = data;
        if (typeof data.body === 'string') {
          parsed = JSON.parse(data.body);
        }

        var uvBadge = document.getElementById('tracker-uv-badge');
        if (uvBadge) {
          uvBadge.textContent = parsed.uv_index + ' ' + parsed.risk_level;
          var riskClass = parsed.risk_level.toLowerCase().replace(' ', '-');
          uvBadge.className = 'uv-badge ' + riskClass;
        }

        var locationEl = document.getElementById('tracker-location');
        if (locationEl && !isDefault) {
          locationEl.textContent = 'Based on your current location • ' + parsed.risk_level + ' risk';
        }
      })
      .catch(function (error) {
        console.error('Failed to fetch UV tracker data:', error);
        var locationEl = document.getElementById('tracker-location');
        if (locationEl) {
          locationEl.textContent = 'Could not load UV data. Please try again later.';
        }
      });
  }

  function autoLocateAndFetchUvTracker() {
    var locationEl = document.getElementById('tracker-location');

    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location for UV tracker');
      if (locationEl) {
        locationEl.textContent = 'Using default location: Melbourne (location unavailable)';
      }
      fetchUvTrackerData(DEFAULT_LAT, DEFAULT_LON, true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log('User location for UV tracker:', lat, lon);
        fetchUvTrackerData(lat, lon, false);
      },
      function (error) {
        console.warn('Geolocation error for UV tracker:', error.message);
        if (locationEl) {
          locationEl.textContent = 'Using default location: Melbourne (location access denied)';
        }
        fetchUvTrackerData(DEFAULT_LAT, DEFAULT_LON, true);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  function onOptionClick(optionId, event) {
    // optionId: 'uv-awareness' | 'skin-type' | 'sunscreen' | 'reminder' | 'uv-tracker' | 'clothing' | 'about'
    console.log('Option clicked:', optionId);
  }

  function onTabClick(tabId, event) {
    // tabId: 'visual-graph' | 'uv-vs' | 'safety-tips' | 'latest-news'
    console.log('Tab clicked:', tabId);
  }

  // Skin type selection (UV Skin Type page)
  async function onSkinTypeSelect(typeId, swatchElement) {
    console.log('Skin type selected:', typeId[4]);

    document.querySelectorAll('[data-action="skin-type"]').forEach(function (el) {
      el.classList.toggle('selected', el === swatchElement);
    });

    var title = swatchElement.getAttribute('data-type-title') || '';
    var description = swatchElement.getAttribute('data-type-description') || '';
    var sensitivity = swatchElement.getAttribute('data-type-sensitivity') || '';
    var protection = swatchElement.getAttribute('data-type-protection') || '';

    var titleEl = document.getElementById('selected-skin-title');
    var descEl = document.getElementById('selected-skin-description');
    var sensEl = document.getElementById('selected-uv-sensitivity');
    var protEl = document.getElementById('selected-protection-level');
    var chipEl = document.getElementById('selected-skin-chip');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description;
    if (sensEl) sensEl.textContent = sensitivity;
    if (protEl) protEl.textContent = protection;

    // Update the skin chip color
    if (chipEl) {
      chipEl.className = 'skin-chip chip-' + typeId;
    }

    const getAdvice_url = API_BASE + `/getSkinTypeAdvice?skin_type=${typeId[4]}`;

    const res_1 = await fetch(getAdvice_url, {
      headers: {
        "Accept": "application/json"
      }
    });
    const advice = await res_1.json();
    console.log(advice);


    const getKnowledge_url = API_BASE + `/getSkinTypeKnowledge?skin_type=${typeId[4]}`;

    const res_2 = await fetch(getKnowledge_url, {
      headers: {
        "Accept": "application/json"
      }
    });
    const knowledge = await res_2.json();
    console.log(knowledge);

    createSkinTypeAdviceElement(advice)
    createSkinTypeKnowledgeElement(knowledge)
  }

  function createSkinTypeAdviceElement(advice) {
    if (document.getElementById("skinTypeAdvice")) {
      document.getElementById("skinTypeAdvice").remove()
    }
    const section = document.createElement("section");
    section.className = "skin-type-selection";
    section.id = "skinTypeAdvice"

    // Title
    const title = document.createElement("h2");
    title.className = "page-title";
    title.textContent = `You Selected:`;
    section.appendChild(title);

    // Card
    const card = document.createElement("div");
    card.className = "skin-type-selected-card";

    const textDiv = document.createElement("div");
    textDiv.className = "skin-selected-text";

    const skinTitle = document.createElement("div");
    skinTitle.id = "selected-skin-title";
    skinTitle.className = "skin-selected-title";
    skinTitle.textContent = advice.name;

    const description = document.createElement("p");
    description.id = "selected-skin-description";
    description.className = "muted";
    description.textContent = advice.description;

    textDiv.appendChild(skinTitle);
    textDiv.appendChild(description);
    card.appendChild(textDiv);

    section.appendChild(card);

    // Stats
    const stats = document.createElement("div");
    stats.className = "skin-stats";

    const stat = document.createElement("div");
    stat.className = "skin-stat";
    stat.style.width = "100%";
    stat.style.marginBottom = "20px";
    stat.innerHTML = `
    UV Sensitivity
    <span id="selected-uv-sensitivity">${advice.sunburn_risk}</span>`;

    stats.appendChild(stat);
    section.appendChild(stats);

    // List
    const ul = document.createElement("ul");
    ul.className = "list-group";


    advice.recommendations.forEach(text => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = text;
      ul.appendChild(li);
    });

    section.appendChild(ul);
    document.getElementById("skinTypeContent").appendChild(section)
  }

  function createSkinTypeKnowledgeElement(data) {
    if (document.getElementById("tableParent")) {
      document.getElementById("tableParent").remove()
    }
    const table_parent = document.createElement("div")
    table_parent.id = "tableParent"
    table_parent.setAttribute("style", "padding: 14px; background-color: white; margin-top: 20px; border-radius: 8px;")

    const table_title = document.createElement("p")
    table_title.innerHTML = "Experimental MED Data Across Countries for Choosed Fitzpatrick Skin Types"
    table_title.setAttribute("style", "width: 100%; font-size: 1.2rem; font-weight: bold")
    table_parent.appendChild(table_title)

    const table = document.createElement("table");
    table.className = "table";
    table.id = "knowledgeTable"

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const headers = [
      "#",
      "Country",
      "Skin Type",
      "Sample size",
      `MED (mJ/cm²)`,
      "SD",
      "Irradiated Skin"
    ];

    headers.forEach(text => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = text;
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    data.forEach((item, index) => {
      const tr = document.createElement("tr");

      const rowNumber = document.createElement("th");
      rowNumber.scope = "row";
      rowNumber.textContent = index + 1;
      tr.appendChild(rowNumber);

      const tdCountry = document.createElement("td");
      tdCountry.textContent = item.Country ?? "";
      tr.appendChild(tdCountry);

      const tdSkinType = document.createElement("td");
      tdSkinType.textContent = item["Skin Type"] ?? "";
      tr.appendChild(tdSkinType);

      const tdSampleSize = document.createElement("td");
      tdSampleSize.textContent = item["Sample size"] ?? "";
      tr.appendChild(tdSampleSize);

      const tdMed = document.createElement("td");
      if (item.MED && typeof item.MED === "object") {
        tdMed.textContent = `${item.MED.value} (${item.MED.type})`;
      } else {
        tdMed.textContent = "";
      }
      tr.appendChild(tdMed);

      const tdSD = document.createElement("td");
      tdSD.textContent = item.SD ?? "";
      tr.appendChild(tdSD);

      const tdSkin = document.createElement("td");
      tdSkin.textContent = item["Irradiated Skin"] ?? "";
      tr.appendChild(tdSkin);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    table_parent.appendChild(table)

    const data_source = document.createElement("p");
    data_source.id = "reference";
    data_source.textContent = "Data source: ";
    const data_sourcelink = document.createElement("a");
    data_sourcelink.id = "dataSource"
    data_sourcelink.href = "https://www.researchgate.net/publication/342129646_Minimal_Erythema_Dose_Correlation_with_Fitzpatrick_Skin_Type_and_Concordance_Between_Methods_of_Erythema_Assessment_in_a_Patient_Sample_in_Colombia";
    data_sourcelink.textContent = "Data adapted from Valbuena et al. (2020).";
    data_sourcelink.style.color = "black";
    data_sourcelink.style.whiteSpace = "nowrap";

    data_source.appendChild(data_sourcelink);
    table_parent.appendChild(data_source);

    document.querySelector("main").appendChild(table_parent)
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Unknown date';
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function renderNews(news) {
    var newsListEl = document.getElementById('news-list');
    var statusEl = document.getElementById('news-status');

    if (!newsListEl) return;

    newsListEl.innerHTML = '';

    if (!Array.isArray(news) || news.length === 0) {
      if (statusEl) statusEl.textContent = 'No UV news found right now.';
      return;
    }

    if (statusEl) statusEl.textContent = '';

    news.forEach(function (article) {
      var title = article.title || 'Untitled article';
      var source = article.source || 'Unknown source';
      var date = formatDate(article.date);
      var url = article.url || '#';

      var item = document.createElement('a');
      item.className = 'news-item';
      item.href = url;
      item.target = '_blank';
      item.rel = 'noreferrer';

      item.innerHTML =
        '<div class="news-title">' + escapeHtml(title) + '</div>' +
        '<div class="news-meta">' + escapeHtml(source) + ' • ' + escapeHtml(date) + '</div>' +
        '<div class="news-desc">Open article</div>';

      newsListEl.appendChild(item);
    });
  }

  function loadLatestNews() {
    var newsListEl = document.getElementById('news-list');
    var statusEl = document.getElementById('news-status');

    if (!newsListEl) return;

    if (statusEl) statusEl.textContent = 'Loading latest UV news...';

    fetch(API_BASE + '/news')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch news: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        console.log('News API response:', data);

        var parsed = data;
        if (typeof data.body === 'string') {
          parsed = JSON.parse(data.body);
        }

        renderNews(parsed.news || []);
      })
      .catch(function (error) {
        console.error('Failed to load news:', error);
        if (statusEl) {
          statusEl.textContent = 'Could not load latest UV news.';
        }
      });
  }

  async function sendReminder() {
    const email = document.getElementById("email-input").value;
    const API_URL = "https://ubwyrwtkcc.execute-api.ap-southeast-2.amazonaws.com/dev1//get-sunscreen-reminder";
    const payload = {
      email: email
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Reminder response:", data);
      alert("Reminder scheduled!");
    } catch (error) {
      console.error("Reminder error:", error);
      alert("Failed to schedule reminder");
    }
  }

  // first diagram
  function visualizeAgeData(data) {

    const labels = data.map(d => d.age_group);

    const sunscreen = data.map(d => Number(d.sunscreen_pct));
    const hat = data.map(d => Number(d.hat_pct));
    const shade = data.map(d => Number(d.shade_pct));
    const sunburn = data.map(d => Number(d.sunburn_pct));
    const tanning = data.map(d => Number(d.tanning_pct));

    const ctx = document.getElementById("firChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sunscreen",
            data: sunscreen
          },
          {
            label: "Hat",
            data: hat
          },
          {
            label: "Shade",
            data: shade
          },
          {
            label: "Sunburn",
            data: sunburn
          },
          {
            label: "Tanning",
            data: tanning
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Age Group"
            }
          },
          y: {
            beginAtZero: true,
            max: 1,
            title: {
              display: true,
              text: "Proportion"
            }
          }
        }
      }
    });

  }

  // second diagram
  function visualizeRateTrend(data) {

    const labels = data.map(d => d.year);
    const rates = data.map(d => Number(d.persons_rate));

    const ctx = document.getElementById("secChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Sunburn Rate",
            data: rates,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Year"
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Percentage of Persons (%)"
            }
          }
        }
      }
    })
  }

  // Third diagram
  let monthlyUVIndex = null;
  function visualizeMonthlyUV(data, city) {
    data = data.filter(item => item.city == city)

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const sortedData = [...data].sort(
      (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    );

    const labels = sortedData.map(d => d.month);
    const uvValues = sortedData.map(d => Number(d.uv_index));

    const ctx = document.getElementById("thrChart").getContext("2d");

    if (monthlyUVIndex) {
      monthlyUVIndex.destroy();
    }

    monthlyUVIndex = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: `UV Index`,
            data: uvValues,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Monthly UV Index in " + city
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Month"
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "UV Index"
            }
          }
        }
      }
    });
  }

  function loadData(file_name) {
    fetch(API_BASE + '/fetchData?file_name=' + file_name)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to fetch news: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        var parsed = data;
        if (typeof data.body === 'string') {
          parsed = JSON.parse(data.body);
        }
        console.log(parsed);

        var title = document.getElementById("table_title")
        if (file_name == 'age_sun_protection.csv') {
          title.innerHTML = 'Sun Protection Behaviour by Age Group'
          visualizeAgeData(parsed)
        }
        else if (file_name == 'melanoma_stats_clean.csv') {
          title
          visualizeRateTrend(parsed)
        }
        else if (file_name == 'bom_uv_clean.csv') {
          title.innerHTML = "Monthly UV Index by City in Australia"
          const city_select = document.createElement("select");
          city_select.id = "selectCity";
          city_select.className = "form-select";
          city_select.setAttribute("aria-label", "Default select example");
          city_select.setAttribute("size", "3");
          const cities = [...new Set(parsed.map(item => item.city))]
            .map(city => ({
              value: city,
              text: city
            }));

          cities.forEach(item => {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.text;
            city_select.appendChild(option);
          });

          city_select.addEventListener("change", function () {
            console.log("show:", this.value);
            visualizeMonthlyUV(parsed, this.value)
          });

          document.getElementById("city_selectContainer").appendChild(city_select);

        }
      })
      .catch(function (error) {
        console.error('Failed to load news:', error);
        if (statusEl) {
          statusEl.textContent = 'Could not load latest UV news.';
        }
      });
  }

  function locatUser(callback) {
    navigator.geolocation.getCurrentPosition(
      function (position) {

        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }

        callback(location)

      },
      function (error) {
        console.warn(error.message)
      }
    )
  }

  function getRisk(uv) {
    if (uv < 3) {
      return "Low"
    }
    else if (uv < 6) {
      return "Moderate"
    }
    else if (uv < 8) {
      return "High"
    }
    else if (uv < 11) {
      return "Very High"
    }
    else {
      return "Extreme"
    }
  }

  function init() {
    document.querySelectorAll('[data-action="get-uv-index"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        onGetUvIndex();
      });
    });

    if (document.getElementById('news-list')) {
      loadLatestNews();
    }

    // automatically locate user position and load UV and weather data
    if (document.getElementById('uvValue')) {
      autoLocateAndFetch();
    }

    //sun Champion quiz function call
    if (document.getElementById("quiz-checklist")) {

      locatUser(function (location) {

        if (location) {
          fetchQuizTips(location.lat, location.lon);
        } else {
          fetchQuizTips(DEFAULT_LAT, DEFAULT_LON);
        }

      });

      var completeBtn = document.getElementById("quiz-complete-btn");

      if (completeBtn) {
        completeBtn.addEventListener("click", function () {
          completeQuiz();
        });
      }

    }

    if (document.getElementById('visual-graph')) {
      document.getElementById("selectData").addEventListener("change", function () {

        let value = this.value;
        document.getElementById('visual-graph').style.display = 'block'
        document.getElementById("firChart").style.display = "none";
        document.getElementById("secChart").style.display = "none";
        document.getElementById("thrChart").style.display = "none";
        document.getElementById("forChart").style.display = "none";
        if (document.getElementById("dataSource") || document.getElementById("reference")) {
          document.getElementById("dataSource").remove()
          document.getElementById("reference").remove()
        }

        if (document.getElementById("selectCity")) {
          document.getElementById("selectCity").remove()
        }

        if (value === "1") {
          document.getElementById("firChart").style.display = "block";
          loadData('age_sun_protection.csv')

          const p = document.createElement("p");
          p.id = "reference";
          p.textContent = "Data provided by ";
          const link = document.createElement("a");
          link.id = "dataSource"
          link.href = "https://www.abs.gov.au/statistics/health/health-conditions-and-risks/sun-protection-behaviours/latest-release";
          link.textContent = "Australian Bureau of Statistics";
          link.style.color = "black";
          link.style.whiteSpace = "nowrap";

          p.appendChild(link);
          document.getElementById('visual-graph').appendChild(p);
        }

        if (value === "2") {
          document.getElementById("secChart").style.display = "block";
          loadData('melanoma_stats_clean.csv')

          const p = document.createElement("p");
          p.id = "reference";
          p.textContent = "Data provided by ";
          const link = document.createElement("a");
          link.id = "dataSource"
          link.href = "https://www.canceraustralia.gov.au/cancer-types/melanoma-skin/melanoma-skin-statistics";
          link.textContent = "Australian Government - Cancer Australia";
          link.style.color = "black";
          link.style.whiteSpace = "nowrap";

          p.appendChild(link);
          document.getElementById('visual-graph').appendChild(p);
        }

        if (value === "3") {
          document.getElementById("thrChart").style.display = "block";
          loadData('bom_uv_clean.csv')

          const p = document.createElement("p");
          p.id = "reference";
          p.textContent = "Data provided by ";
          const link = document.createElement("a");
          link.id = "dataSource"
          link.href = "https://www.bom.gov.au/climate/maps/averages/uv-index/";
          link.textContent = "Australian Government - Bureau of Meteorology";
          link.style.color = "black";
          link.style.whiteSpace = "nowrap";

          p.appendChild(link);
          document.getElementById('visual-graph').appendChild(p);
        }
      });
    }

    // automatically load sunscreen data on sunscreen-guide page
    if (document.getElementById('sunscreen-uv-badge')) {
      autoLocateAndFetchSunscreen();
    }

    // automatically load UV data on uv-tracker page
    if (document.getElementById('tracker-uv-badge')) {
      autoLocateAndFetchUvTracker();
    }



    if (document.getElementById("getTipsByLocation")) {
      document.getElementById("getTipsByLocation").addEventListener('click', function (e) {
        const container = document.createElement("div");
        container.className = "d-flex justify-content-center";

        const spinner = document.createElement("div");
        spinner.className = "spinner-border";
        spinner.setAttribute("role", "status");

        const span = document.createElement("span");
        span.className = "visually-hidden";
        span.textContent = "Loading...";

        spinner.appendChild(span);
        container.appendChild(spinner);

        document.getElementById("getTipsByLocationParent").appendChild(container);
        document.getElementById("getTipsByLocation").remove()
        locatUser(async function (location) {
          console.log(location)
          const convert_location_url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lon}`;

          const res_1 = await fetch(convert_location_url, {
            headers: {
              "Accept": "application/json"
            }
          });
          const address_data = await res_1.json();
          console.log(address_data);
          document.getElementById("userLocation").innerHTML = `Location: ${address_data.address.city}, ${address_data.address.state}`

          const fetchUVIndex_url = API_BASE + `/getUV?lat=${location.lat}&lon=${location.lon}`;

          const res_2 = await fetch(fetchUVIndex_url, {
            headers: {
              "Accept": "application/json"
            }
          });
          const uv_index = await res_2.json();
          console.log(uv_index);
          document.getElementById("uvIndex").innerHTML = `${uv_index.current_uv_index} - ${getRisk(uv_index.current_uv_index)}`

          // console.log('sssssssss', uv_index.current_uv_index, address_data.address.city, address_data.address.state);

          const getTips_url = API_BASE + `/getTips?uv_index=${uv_index.current_uv_index}&city=${address_data.address.city}&state=${address_data.address.state}`;

          const res_3 = await fetch(getTips_url, {
            headers: {
              "Accept": "application/json"
            }
          });
          const tips = await res_3.json();
          console.log(tips);

          document.getElementById("tipsList").innerHTML = ''
          document.getElementById("tipsPlaceholder").remove()
          for (let index = 0; index < tips.final_tips.length; index++) {
            var tip = document.createElement('li');
            tip.textContent = tips.final_tips[index];
            tip.setAttribute("data-num", index + 1)
            document.getElementById("tipsList").appendChild(tip);

          }
          document.getElementById("buttonBar").remove()

        })

      })
    }

    document.querySelectorAll('[data-action="option"]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        var id = card.getAttribute('data-option') || '';
        onOptionClick(id, e);
      });
    });

    document.querySelectorAll('[data-action="tab"]').forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        var id = tab.getAttribute('data-tab') || '';
        onTabClick(id, e);
      });
    });

    document.querySelectorAll('[data-action="skin-type"]').forEach(function (swatch) {
      swatch.addEventListener('click', function (e) {
        e.preventDefault();
        var id = swatch.getAttribute('data-type-id') || '';
        if (!id) return;
        onSkinTypeSelect(id, swatch);
      });
    });

    const reminderBtn = document.getElementById("save-reminder-btn");
    if (reminderBtn) {
      reminderBtn.addEventListener("click", function () {
        sendReminder();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();