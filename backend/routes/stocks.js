const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Get stock suggestions based on category and search term
router.get('/stock-suggestions', async (req, res) => {
    try {
        const { category, term } = req.query;
        if (!category || !term) {
            return res.status(400).json({ error: 'Category and search term are required' });
        }

        const datasetPath = path.join(__dirname, '..', 'dataset', category);
        
        try {
            const files = await fs.readdir(datasetPath);
            const stockFiles = files.filter(file => file.endsWith('.csv'));
            
            // Get stock names from CSV filenames (remove .csv extension)
            const stockNames = stockFiles.map(file => file.replace('.csv', ''));
            
            // Filter stocks based on search term (case-insensitive)
            const suggestions = stockNames.filter(stock => 
                stock.toLowerCase().includes(term.toLowerCase())
            );

            // Sort suggestions by relevance (starts with term first, then includes term)
            suggestions.sort((a, b) => {
                const aStartsWith = a.toLowerCase().startsWith(term.toLowerCase());
                const bStartsWith = b.toLowerCase().startsWith(term.toLowerCase());
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return a.localeCompare(b);
            });

            // Limit to top 10 suggestions
            const limitedSuggestions = suggestions.slice(0, 10);
            
            res.json(limitedSuggestions);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // If directory doesn't exist, return empty array
                res.json([]);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error in stock suggestions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
