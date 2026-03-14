/**
 * Happy Sun - Button & interaction handlers
 */

var API_BASE = 'https://ubwyrwtkcc.execute-api.ap-southeast-2.amazonaws.com/dev1';

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
  function onSkinTypeSelect(typeId, swatchElement) {
    console.log('Skin type selected:', typeId);

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

    // automatically load sunscreen data on sunscreen-guide page
    if (document.getElementById('sunscreen-uv-badge')) {
      autoLocateAndFetchSunscreen();
    }

    // automatically load UV data on uv-tracker page
    if (document.getElementById('tracker-uv-badge')) {
      autoLocateAndFetchUvTracker();
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