// Elementos del DOM

// Variables
const elements = {
    marca: document.querySelector('#marca'),
    year: document.querySelector('#year'),
    minimo: document.querySelector('#minimo'),
    maximo: document.querySelector('#maximo'),
    puertas: document.querySelector('#puertas'),
    transmision: document.querySelector('#transmision'),
    color: document.querySelector('#color'),
    resultado: document.querySelector('#resultado'),
    resetBtn: document.querySelector('#resetBtn'),
    resultsInfo: document.querySelector('#resultsInfo'),
    sortSelect: document.querySelector('#sortSelect'),
    themeBtn: document.querySelector('#themeBtn')
};

// Estado de la búsqueda
let searchState = {
    marca: '',
    year: '',
    minimo: '',
    maximo: '',
    puertas: '',
    transmision: '',
    color: '',
    sortBy: 'default'
};

let currentResults = [...autos];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    populateYearSelect();
    showCars(autos);
    updateResultsInfo(autos.length);
    attachEventListeners();
    initializeTheme();
}

function populateYearSelect() {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 10;
    
    for (let year = currentYear; year >= minYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        elements.year.appendChild(option);
    }
}

function attachEventListeners() {
    // Event listeners para filtros
    Object.keys(elements).forEach(key => {
        if (elements[key] && elements[key].tagName === 'SELECT' && key !== 'sortSelect') {
            elements[key].addEventListener('change', (e) => {
                searchState[key] = key === 'year' || key === 'puertas' ? 
                    parseInt(e.target.value) || '' : e.target.value;
                debounceFilter();
            });
        }
    });

    // Event listener para ordenamiento
    elements.sortSelect.addEventListener('change', (e) => {
        searchState.sortBy = e.target.value;
        showCars(currentResults);
    });

    // Event listener para reset
    elements.resetBtn.addEventListener('click', resetFilters);

    // Event listener para cambio de tema
    elements.themeBtn.addEventListener('click', toggleTheme);
}

// Debounce para mejorar performance
let filterTimeout;
function debounceFilter() {
    clearTimeout(filterTimeout);
    showLoading();
    filterTimeout = setTimeout(() => {
        filterCars();
    }, 300);
}

function showLoading() {
    elements.resultado.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Buscando vehículos...
        </div>
    `;
}

function filterCars() {
    currentResults = autos.filter(car => {
        return Object.keys(searchState).every(key => {
            if (key === 'sortBy' || !searchState[key]) return true;
            
            switch(key) {
                case 'minimo':
                    return car.precio >= parseInt(searchState[key]);
                case 'maximo':
                    return car.precio <= parseInt(searchState[key]);
                default:
                    return car[key] === searchState[key];
            }
        });
    });

    showCars(currentResults);
    updateResultsInfo(currentResults.length);
}

// Funciones para el modo oscuro
function initializeTheme() {
    const savedTheme = 'light'; // No usamos localStorage
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeButton(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    const icon = elements.themeBtn.querySelector('i');
    const text = elements.themeBtn.querySelector('span') || elements.themeBtn.childNodes[2];
    
    if (isDark) {
        icon.className = 'fas fa-sun';
        if (text) text.textContent = ' Modo Claro';
        else elements.themeBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
        icon.className = 'fas fa-moon';
        if (text) text.textContent = ' Modo Oscuro';
        else elements.themeBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }
}

function showCars(cars) {
    // Aplicar ordenamiento
    const sortedCars = sortCars([...cars], searchState.sortBy);
    
    if (sortedCars.length === 0) {
        showNoResults();
        return;
    }

    elements.resultado.innerHTML = '';
    
    sortedCars.forEach((car, index) => {
        const carElement = createCarCard(car);
        carElement.style.animationDelay = `${index * 0.1}s`;
        elements.resultado.appendChild(carElement);
    });
}

function createCarCard(car) {
    const carCard = document.createElement('div');
    carCard.className = 'car-card fade-in';
    
    const transmissionIcon = car.transmision === 'automatico' ? 
        'fas fa-cog' : 'fas fa-hand-paper';
    
    const colorIcon = getColorIcon(car.color);
    
    carCard.innerHTML = `
        <div class="car-header">
            <div>
                <div class="car-brand">${car.marca}</div>
                <div class="car-model">${car.modelo}</div>
            </div>
            <div class="car-year">${car.year}</div>
        </div>
        
        <div class="car-details">
            <div class="detail-item">
                <i class="detail-icon fas fa-door-open"></i>
                <span class="detail-text">${car.puertas} Puertas</span>
            </div>
            <div class="detail-item">
                <i class="detail-icon ${transmissionIcon}"></i>
                <span class="detail-text">${car.transmision === 'automatico' ? 'Automática' : 'Manual'}</span>
            </div>
            <div class="detail-item">
                <i class="detail-icon ${colorIcon}" style="color: ${getColorValue(car.color)}"></i>
                <span class="detail-text">${car.color}</span>
            </div>
            <div class="detail-item">
                <i class="detail-icon fas fa-calendar"></i>
                <span class="detail-text">${car.year}</span>
            </div>
        </div>
        
        <div class="car-price">
            $${car.precio.toLocaleString()}
        </div>
    `;
    
    return carCard;
}

function getColorIcon(color) {
    const icons = {
        'Negro': 'fas fa-circle',
        'Blanco': 'far fa-circle',
        'Rojo': 'fas fa-circle',
        'Azul': 'fas fa-circle'
    };
    return icons[color] || 'fas fa-circle';
}

function getColorValue(color) {
    const colors = {
        'Negro': '#2c3e50',
        'Blanco': '#ecf0f1',
        'Rojo': '#e74c3c',
        'Azul': '#3498db'
    };
    return colors[color] || '#95a5a6';
}

function sortCars(cars, sortBy) {
    switch(sortBy) {
        case 'precio-asc':
            return cars.sort((a, b) => a.precio - b.precio);
        case 'precio-desc':
            return cars.sort((a, b) => b.precio - a.precio);
        case 'year-desc':
            return cars.sort((a, b) => b.year - a.year);
        case 'year-asc':
            return cars.sort((a, b) => a.year - b.year);
        case 'marca':
            return cars.sort((a, b) => a.marca.localeCompare(b.marca));
        default:
            return cars;
    }
}

function showNoResults() {
    elements.resultado.innerHTML = `
        <div class="no-results">
            <i class="no-results-icon fas fa-search"></i>
            <h3>No se encontraron resultados</h3>
            <p>Intenta ajustar los filtros de búsqueda para encontrar más opciones</p>
        </div>
    `;
}

function updateResultsInfo(count) {
    const totalCars = autos.length;
    if (count === totalCars) {
        elements.resultsInfo.textContent = `Mostrando todos los ${totalCars} vehículos`;
    } else {
        elements.resultsInfo.textContent = `${count} de ${totalCars} vehículos encontrados`;
    }
}

function resetFilters() {
    // Reset search state
    searchState = {
        marca: '',
        year: '',
        minimo: '',
        maximo: '',
        puertas: '',
        transmision: '',
        color: '',
        sortBy: 'default'
    };

    // Reset form elements
    Object.keys(elements).forEach(key => {
        if (elements[key] && elements[key].tagName === 'SELECT') {
            elements[key].value = '';
        }
    });

    // Reset results
    currentResults = [...autos];
    showCars(currentResults);
    updateResultsInfo(currentResults.length);
}