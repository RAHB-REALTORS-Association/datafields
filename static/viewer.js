// Function to get URL parameters
function getUrlParameter(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

function updateUrl(params) {
    const url = new URL(window.location);
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    }
    window.history.pushState({}, '', url);
}

// CSV Parsing Function
function parseCSV(text) {
    let lines = text.split('\n');
    let result = [];
    let headers = lines[0].split(',');

    for(let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(',');
        let j = 0, temp = '';

        for (let cell of currentline) {
            if (cell.startsWith('"') && !cell.endsWith('"')) {
                temp = cell;
            } else if (!cell.startsWith('"') && cell.endsWith('"')) {
                temp += ',' + cell;
                obj[headers[j]] = temp.slice(1, -1);
                temp = '';
                j++;
            } else if (temp !== '') {
                temp += ',' + cell;
            } else {
                obj[headers[j]] = cell;
                j++;
            }
        }

        result.push(obj);
    }
    return result;
}

// Implement search functionality
function searchTable() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    updateUrl({search: input});

    const table = document.getElementById('dataTable');
    const rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let match = false;

        for (const cell of cells) {
            const text = cell.textContent.toLowerCase();
            if (text.includes(input)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? '' : 'none';
    }
}

// Fetch the list of available CSV files from fileList.json
fetch('data/fileList.json')
    .then(response => response.json())
    .then(data => {
        const select = document.getElementById('csvSelect');
        for (const file of data.files) {
            const option = document.createElement('option');
            option.value = file;
            option.textContent = file;
            select.appendChild(option);
        }

        // Load the CSV file and populate the table
        loadCSV(() => {
            const searchParam = getUrlParameter('search');
            // If a search term is specified, trigger the search function
            if (searchParam) {
                document.getElementById('searchInput').value = searchParam;
                searchTable();
            }
        });
    });

let isInitialLoad = true; // flag to check if it's the first time the page is loaded

function loadCSV(callback) {
    let selectedFile = document.getElementById('csvSelect').value;
    
    // If it's the initial load, check if 'file' parameter exists in URL
    if (isInitialLoad) {
        const fileParam = getUrlParameter('file');
        if (fileParam) {
            selectedFile = fileParam;
            document.getElementById('csvSelect').value = selectedFile;
        }
    }
    
    // Update URL only if it's not the initial load
    if (!isInitialLoad) {
        updateUrl({file: selectedFile});
    }

    fetch(`data/${selectedFile}`)
        .then(response => response.text())
        .then(data => {
            const parsedData = parseCSV(data);
            const table = document.getElementById('tableBody');
            table.innerHTML = ''; // Clear existing rows

            for (const row of parsedData) {
                const tr = document.createElement('tr');
                for (const [key, value] of Object.entries(row)) {
                    const td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            }
            if (callback) {
                callback();
            }
        });
    
    // Set the flag to false after the first load
    isInitialLoad = false;
}

// Attach an event listener to the dropdown
document.getElementById('csvSelect').addEventListener('change', function() {
    loadCSV(() => {
        const searchParam = document.getElementById('searchInput').value;
        if (searchParam) {
            searchTable();
        }
    }); 
});

// Attach an event listener to the search input for 'Enter' key press
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        searchTable();
    }
});

// Attach an event listener to the search button for clicks
document.getElementById('searchButton').addEventListener('click', function() {
    searchTable();
});

// Attach an event listener to the download button for clicks
document.getElementById('downloadLink').addEventListener('click', function() {
    let selectedFile = document.getElementById('csvSelect').value;
    let url = `data/${selectedFile}`;
    let a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// Scroll to top button
let timeout;
let isHovered = false; // flag to check if the button is being hovered over

const scrollToTopButton = document.getElementById("scrollToTopButton");

function showButton() {
    scrollToTopButton.style.display = 'block';
    scrollToTopButton.classList.remove('fade-out');
    scrollToTopButton.classList.add('fade-in');
}

function hideButton() {
    if (!isHovered) {
        scrollToTopButton.classList.remove('fade-in');
        scrollToTopButton.classList.add('fade-out');
        setTimeout(() => {
            if (!isHovered) {
                scrollToTopButton.style.display = 'none';
            }
        }, 500); // match this with your CSS transition time
    }
}

window.addEventListener('scroll', function() {
    if (window.scrollY > 200) {
        showButton();
        clearTimeout(timeout);
        timeout = setTimeout(hideButton, 2000); // 2 seconds
    }
});

// Handle hover state
scrollToTopButton.addEventListener('mouseenter', function() {
    isHovered = true;
});

scrollToTopButton.addEventListener('mouseleave', function() {
    isHovered = false;
    hideButton();
});

// Scroll to top on click
scrollToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});