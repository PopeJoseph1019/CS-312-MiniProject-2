// Import required modules
const express = require('express');
const axios = require('axios');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// API Base URL
const API_BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

// Routes

// Home page
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Cocktail Recipe Finder',
    error: null
  });
});

// Search cocktails by name
app.post('/search', async (req, res) => {
  const { searchQuery, searchType } = req.body;
  
  try {
    let apiUrl;
    
    // Determine API endpoint based on search type
    if (searchType === 'name') {
      apiUrl = `${API_BASE_URL}/search.php?s=${encodeURIComponent(searchQuery)}`;
    } else if (searchType === 'ingredient') {
      apiUrl = `${API_BASE_URL}/filter.php?i=${encodeURIComponent(searchQuery)}`;
    }
    
    // Make API request
    const response = await axios.get(apiUrl);
    
    // Check if drinks were found
    if (!response.data.drinks) {
      return res.render('index', {
        title: 'Cocktail Recipe Finder',
        error: `No cocktails found for "${searchQuery}". Please try a different search.`
      });
    }
    
    // Render results page
    res.render('results', {
      title: 'Search Results',
      cocktails: response.data.drinks,
      searchQuery: searchQuery,
      searchType: searchType
    });
    
  } catch (error) {
    console.error('Error fetching cocktails:', error.message);
    res.render('index', {
      title: 'Cocktail Recipe Finder',
      error: 'An error occurred while searching. Please try again later.'
    });
  }
});

// Get random cocktail
app.get('/random', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/random.php`);
    
    if (!response.data.drinks || response.data.drinks.length === 0) {
      return res.render('index', {
        title: 'Cocktail Recipe Finder',
        error: 'Could not fetch a random cocktail. Please try again.'
      });
    }
    
    const cocktail = response.data.drinks[0];
    res.render('detail', {
      title: cocktail.strDrink,
      cocktail: cocktail
    });
    
  } catch (error) {
    console.error('Error fetching random cocktail:', error.message);
    res.render('index', {
      title: 'Cocktail Recipe Finder',
      error: 'An error occurred while fetching a random cocktail. Please try again.'
    });
  }
});

// Get cocktail details by ID
app.get('/cocktail/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const response = await axios.get(`${API_BASE_URL}/lookup.php?i=${id}`);
    
    if (!response.data.drinks || response.data.drinks.length === 0) {
      return res.render('index', {
        title: 'Cocktail Recipe Finder',
        error: 'Cocktail not found. Please try a different search.'
      });
    }
    
    const cocktail = response.data.drinks[0];
    res.render('detail', {
      title: cocktail.strDrink,
      cocktail: cocktail
    });
    
  } catch (error) {
    console.error('Error fetching cocktail details:', error.message);
    res.render('index', {
      title: 'Cocktail Recipe Finder',
      error: 'An error occurred while loading the cocktail details. Please try again.'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('index', {
    title: 'Page Not Found',
    error: 'The page you are looking for does not exist.'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});