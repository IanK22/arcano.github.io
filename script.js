document.addEventListener('DOMContentLoaded', function () {
  var btnStart = document.getElementById('btn-start');
  var btnInfo = document.getElementById('btn-info');
  var btnSchool = document.getElementById('btn-school');
  var btnSearch = document.getElementById('btn-search');
  var searchPanel = document.getElementById('search-panel');
  var searchInput = document.getElementById('search-input');
  var searchGo = document.getElementById('search-go');
  var searchClose = document.getElementById('search-close');
  var buttonContainer = document.querySelector('.button-container');
  var btnBack = document.getElementById('btn-back');
  // 🔹 Ahora buscamos el contenedor correcto
  var content = document.getElementById('main-content');
  var btnResources = document.getElementById('btn-resources');
  var resourcesSection = document.getElementById('resources');
  var btnElaboracion = document.getElementById('btn-elaboracion');
  var btnReferencias = document.getElementById('btn-referencias');

  function openFromDataLink(btn) {
    if (!btn) return false;
    var url = btn.getAttribute('data-link');
    if (!url) return false;
    var target = btn.getAttribute('data-target') || '_blank';
    if (target === '_self') window.location.href = url;
    else window.open(url, target);
    return true;
  }

  if (btnStart) {
    btnStart.addEventListener('click', function () {
      if (!openFromDataLink(btnStart)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (btnInfo) {
    btnInfo.addEventListener('click', function () {
      var benefits = document.getElementById('benefits');
      if (benefits) benefits.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (btnSchool) {
    btnSchool.addEventListener('click', function () {
      openFromDataLink(btnSchool);
    });
  }

  if (btnElaboracion) {
    btnElaboracion.addEventListener('click', function () {
      openFromDataLink(btnElaboracion);
    });
  }

  if (btnReferencias) {
    btnReferencias.addEventListener('click', function () {
      openFromDataLink(btnReferencias);
    });
  }

  // Mostrar/ocultar panel y posicionarlo
  if (btnSearch && searchPanel) {
    btnSearch.addEventListener('click', function () {
      var isHidden = searchPanel.classList.contains('hidden');
      if (isHidden) {
        searchPanel.classList.remove('hidden');
        requestAnimationFrame(positionPanelLeftOfButton);
        searchPanel.setAttribute('aria-hidden', 'false');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
      } else {
        clearHighlights();
        searchPanel.classList.add('hidden');
        searchPanel.setAttribute('aria-hidden', 'true');
      }
    });

    window.addEventListener('resize', function () {
      if (searchPanel && !searchPanel.classList.contains('hidden')) {
        positionPanelLeftOfButton();
      }
    });
  }

  if (searchGo && searchInput) {
    searchGo.addEventListener('click', function () {
      performSearch(searchInput.value);
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      }
      if (e.key === 'Escape') {
        clearHighlights();
        if (searchPanel) {
          searchPanel.classList.add('hidden');
          searchPanel.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  if (searchClose) {
    searchClose.addEventListener('click', function () {
      clearHighlights();
      if (searchPanel) {
        searchPanel.classList.add('hidden');
        searchPanel.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (btnResources) {
    btnResources.addEventListener('click', function () {
      if (resourcesSection) resourcesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else alert('Sección de recursos no disponible.');
    });
  }

  function positionPanelLeftOfButton() {
    if (!btnSearch || !searchPanel || !buttonContainer) return;
    var gap = 8;
    var btnRect = btnSearch.getBoundingClientRect();
    var containerRect = buttonContainer.getBoundingClientRect();
    var maxPanelWidth = Math.min(420, Math.floor(containerRect.width * 0.9));
    var availableLeft = btnRect.left - containerRect.left - gap;

    if (availableLeft >= 120) {
      var panelWidth = Math.min(maxPanelWidth, availableLeft - 8);
      panelWidth = Math.max(panelWidth, 120);
      var left = btnRect.left - containerRect.left - panelWidth - gap;
      var top = btnRect.top - containerRect.top + (btnRect.height / 2) - (searchPanel.offsetHeight / 2);
      searchPanel.style.left = Math.round(left) + 'px';
      searchPanel.style.top = Math.round(Math.max(6, top)) + 'px';
      searchPanel.style.width = Math.round(panelWidth) + 'px';
    } else {
      var rightAvailable = containerRect.right - btnRect.right - gap;
      var panelWidth = Math.min(maxPanelWidth, Math.max(120, Math.floor(rightAvailable - 8)));
      if (panelWidth < 120) {
        panelWidth = Math.min(maxPanelWidth, Math.floor(containerRect.width - 32));
      }
      var left = btnRect.right - containerRect.left + gap;
      var top = btnRect.top - containerRect.top + (btnRect.height / 2) - (searchPanel.offsetHeight / 2);
      searchPanel.style.left = Math.round(left) + 'px';
      searchPanel.style.top = Math.round(Math.max(6, top)) + 'px';
      searchPanel.style.width = Math.round(panelWidth) + 'px';
    }
  }

  function performSearch(term) {
    if (!term || !content) return;
    clearHighlights();
    var regex = new RegExp(escapeRegExp(term), 'gi');
    highlightMatches(content, regex);
    var first = content.querySelector('mark.highlight');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else alert('No se encontraron coincidencias.');
  }

  function clearHighlights() {
    if (!content) return;
    var marks = content.querySelectorAll('mark.highlight');
    marks.forEach(function (mark) {
      var parent = mark.parentNode;
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  function highlightMatches(rootEl, regex) {
    if (!rootEl) return;
    var walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, noscript, mark, button, a')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }, false);

    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(function (node) {
      var text = node.nodeValue;
      regex.lastIndex = 0;
      if (!regex.test(text)) return;
      var frag = document.createDocumentFragment();
      var lastIndex = 0;
      regex.lastIndex = 0;
      var match;
      while ((match = regex.exec(text)) !== null) {
        var before = text.slice(lastIndex, match.index);
        if (before) frag.appendChild(document.createTextNode(before));
        var mark = document.createElement('mark');
        mark.className = 'highlight';
        mark.textContent = match[0];
        frag.appendChild(mark);
        lastIndex = match.index + match[0].length;
      }
      var after = text.slice(lastIndex);
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
});

if (btnBack) {
  btnBack.addEventListener('click', function () {
    var url = btnBack.getAttribute('data-link');
    var target = btnBack.getAttribute('data-target') || '_self';
    if (target === '_self') window.location.href = url;
    else window.open(url, target);
  });
}

