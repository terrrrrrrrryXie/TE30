/**
 * Happy Sun - Button & interaction handlers
 */

var API_BASE = 'https://ubwyrwtkcc.execute-api.ap-southeast-2.amazonaws.com/dev1';

(function () {
  'use strict';

  function onGetUvIndex() {
    // TODO: fetch UV API, update location, show result, etc.
    console.log('Get UV Index clicked');
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