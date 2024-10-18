// static/viewer.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    initApp();
  });
  
  async function initApp() {
    await populateFileList();
    const urlParams = new URLSearchParams(window.location.search);
    const fileParam = urlParams.get('file');
    const searchParam = urlParams.get('search');
  
    if (fileParam) {
      document.getElementById('csvSelect').value = fileParam;
    }
  
    await loadCSV();
  
    if (searchParam) {
      document.getElementById('searchInput').value = searchParam;
      searchTable();
    }
  
    attachEventListeners();
  
    // Apply saved theme preference
    applyThemePreference();
  }
  
  async function populateFileList() {
    try {
      const response = await fetch('data/fileList.json');
      const data = await response.json();
      const select = document.getElementById('csvSelect');
  
      data.files.forEach((file) => {
        const option = document.createElement('option');
        option.value = file;
        option.textContent = file;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  }
  
  let parsedData = [];
  let filteredData = [];
  let currentPage = 1;
  const rowsPerPage = 20;
  
  async function loadCSV() {
    const selectedFile = document.getElementById('csvSelect').value;
    updateUrlParams({ file: selectedFile });
    showLoadingSpinner();
  
    try {
      const response = await fetch(`data/${selectedFile}`);
      const csvText = await response.text();
  
      // Parse CSV using Papa Parse
      parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      }).data;
  
      // Reset search and pagination
      document.getElementById('searchInput').value = '';
      currentPage = 1;
      filteredData = parsedData;
  
      renderTable();
      setupPagination();
    } catch (error) {
      console.error('Error loading CSV:', error);
    } finally {
      hideLoadingSpinner();
    }
  }
  
  function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
  
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
  
    paginatedData.forEach((row) => {
      const tr = document.createElement('tr');
      Object.values(row).forEach((cellValue) => {
        const td = document.createElement('td');
        td.textContent = cellValue;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }
  
  function setupPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
  
    if (totalPages <= 1) return; // No need for pagination
  
    // Previous Button
    const prevLi = document.createElement('li');
    prevLi.classList.add('page-item', currentPage === 1 ? 'disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevLi.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        renderTable();
        setupPagination();
      }
    });
    pagination.appendChild(prevLi);
  
    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.classList.add('page-item', currentPage === i ? 'active' : '');
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = i;
        renderTable();
        setupPagination();
      });
      pagination.appendChild(li);
    }
  
    // Next Button
    const nextLi = document.createElement('li');
    nextLi.classList.add('page-item', currentPage === totalPages ? 'disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextLi.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        setupPagination();
      }
    });
    pagination.appendChild(nextLi);
  }
  
  function searchTable() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    updateUrlParams({ search: query });
    currentPage = 1;
  
    if (query === '') {
      filteredData = parsedData;
    } else {
      filteredData = parsedData.filter((row) =>
        Object.values(row).some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }
  
    renderTable();
    setupPagination();
  }
  
  function attachEventListeners() {
    document.getElementById('csvSelect').addEventListener('change', loadCSV);
    document.getElementById('searchButton').addEventListener('click', searchTable);
    document.getElementById('searchInput').addEventListener('input', debounce(searchTable, 300));
    document.getElementById('downloadLink').addEventListener('click', downloadCSV);
    document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('scrollToTopButton').addEventListener('click', scrollToTop);
  
    // Scroll event for "Scroll to Top" button
    window.addEventListener('scroll', handleScroll);
  }
  
  function downloadCSV() {
    const selectedFile = document.getElementById('csvSelect').value;
    const url = `data/${selectedFile}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  function updateUrlParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', url);
  }
  
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
  
    // Update the icon
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.classList.toggle('bi-moon-fill', !isDarkMode);
    themeIcon.classList.toggle('bi-brightness-high-fill', isDarkMode);
  }
  
  function applyThemePreference() {
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      const themeIcon = document.getElementById('themeIcon');
      themeIcon.classList.replace('bi-moon-fill', 'bi-brightness-high-fill');
    }
  }
  
  // Scroll to Top Functionality
  function handleScroll() {
    const scrollToTopButton = document.getElementById('scrollToTopButton');
    if (window.scrollY > 200) {
      scrollToTopButton.style.display = 'block';
      scrollToTopButton.classList.add('fade-in');
      scrollToTopButton.classList.remove('fade-out');
    } else {
      scrollToTopButton.classList.add('fade-out');
      scrollToTopButton.classList.remove('fade-in');
      setTimeout(() => {
        scrollToTopButton.style.display = 'none';
      }, 500);
    }
  }
  
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  
  // Loading Spinner (optional)
  function showLoadingSpinner() {
    // You can implement a spinner if desired
  }
  
  function hideLoadingSpinner() {
    // Hide the spinner after loading
  }
  