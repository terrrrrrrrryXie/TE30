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
      })
      .catch(function (error) {
        console.error('Failed to fetch clothing recommendation:', error);
      });
  }

  function onGetUvIndex() {
    fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
  }

  function autoLocateAndFetch() {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location');
      fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log('User location:', lat, lon);
        fetchClothingData(lat, lon);
      },
      function (error) {
        console.warn('Geolocation error:', error.message);
        console.log('Using default location');
        fetchClothingData(DEFAULT_LAT, DEFAULT_LON);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  function fetchSunscreenData(lat, lon) {
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
          uvBadge.textContent = 'UV ' + parsed.uv_index;
          var riskClass = parsed.risk_level.toLowerCase().replace(' ', '-');
          uvBadge.className = 'uv-badge ' + riskClass;
        }

        var locationEl = document.getElementById('sunscreen-location');
        if (locationEl) {
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
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location for sunscreen');
      fetchSunscreenData(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        console.log('User location for sunscreen:', lat, lon);
        fetchSunscreenData(lat, lon);
      },
      function (error) {
        console.warn('Geolocation error for sunscreen:', error.message);
        fetchSunscreenData(DEFAULT_LAT, DEFAULT_LON);
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

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description;
    if (sensEl) sensEl.textContent = sensitivity;
    if (protEl) protEl.textContent = protection;
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