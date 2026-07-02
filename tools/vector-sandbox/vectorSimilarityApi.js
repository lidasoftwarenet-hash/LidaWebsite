/**
 * Client for Demo Vector Similarity API with Local Fallback Data
 */

const VECTOR_API_BASE_URL = 'https://lidabenzotracker.onrender.com/api/vector';

// Local Mock Categories
const MOCK_CATEGORIES = [
    { name: 'spelling_similar_meaning_different', count: 25 },
    { name: 'very_similar', count: 5 },
    { name: 'opposite', count: 5 },
    { name: 'unrelated', count: 5 }
];

// Local Mock Examples Database
const MOCK_EXAMPLES = [
    // Very Similar
    {
        textA: 'car',
        textB: 'vehicle',
        category: 'very_similar',
        relation: 'very_similar',
        explanation: 'Car and vehicle are strongly connected in meaning. A car is a specific type of vehicle.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.925, dotProduct: 0.856, euclideanDistance: 0.124 },
        interpretation: { label: 'These two terms are very close in meaning.', summary: 'Highly aligned in vector space due to overlapping semantic categories.' }
    },
    {
        textA: 'python',
        textB: 'anaconda',
        category: 'very_similar',
        relation: 'very_similar',
        explanation: 'Anaconda is a major distribution of Python, making them closely related in tech contexts.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.812, dotProduct: 0.745, euclideanDistance: 0.312 },
        interpretation: { label: 'These two terms are related, but not almost identical.', summary: 'Strong semantic association within the data science context.' }
    },
    {
        textA: 'computer',
        textB: 'laptop',
        category: 'very_similar',
        relation: 'very_similar',
        explanation: 'A laptop is a portable computer, sharing most core conceptual features.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.895, dotProduct: 0.810, euclideanDistance: 0.180 },
        interpretation: { label: 'These two terms are very close in meaning.', summary: 'High semantic overlap as laptop is a subset of computer.' }
    },
    {
        textA: 'smart',
        textB: 'intelligent',
        category: 'very_similar',
        relation: 'very_similar',
        explanation: 'Smart and intelligent are direct synonyms in most contexts.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.941, dotProduct: 0.912, euclideanDistance: 0.089 },
        interpretation: { label: 'These two terms are very close in meaning.', summary: 'Direct synonym relationship with near-perfect vector alignment.' }
    },
    {
        textA: 'fast',
        textB: 'quick',
        category: 'very_similar',
        relation: 'very_similar',
        explanation: 'Fast and quick both denote high speed and are used interchangeably.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.932, dotProduct: 0.899, euclideanDistance: 0.105 },
        interpretation: { label: 'These two terms are very close in meaning.', summary: 'High semantic similarity as direct speed synonyms.' }
    },

    // Opposite
    {
        textA: 'hot',
        textB: 'cold',
        category: 'opposite',
        relation: 'opposite',
        explanation: 'Hot and cold represent opposite ends of the temperature spectrum.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.742, dotProduct: -0.680, euclideanDistance: 2.105 },
        interpretation: { label: 'These two terms point in opposite directions in this demo.', summary: 'Antonyms representing opposite poles of a single scale.' }
    },
    {
        textA: 'love',
        textB: 'hate',
        category: 'opposite',
        relation: 'opposite',
        explanation: 'Love and hate represent opposing strong emotions.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.812, dotProduct: -0.755, euclideanDistance: 2.312 },
        interpretation: { label: 'These two terms point in opposite directions in this demo.', summary: 'Strong emotional antonyms pointing in opposite semantic directions.' }
    },
    {
        textA: 'up',
        textB: 'down',
        category: 'opposite',
        relation: 'opposite',
        explanation: 'Up and down represent opposite vertical directions.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.915, dotProduct: -0.885, euclideanDistance: 2.650 },
        interpretation: { label: 'These two terms point in opposite directions in this demo.', summary: 'Perfect directional opposites.' }
    },
    {
        textA: 'rich',
        textB: 'poor',
        category: 'opposite',
        relation: 'opposite',
        explanation: 'Rich and poor represent opposite economic statuses.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.685, dotProduct: -0.612, euclideanDistance: 1.980 },
        interpretation: { label: 'These two terms point in opposite directions in this demo.', summary: 'Conceptual opposites along the wealth axis.' }
    },
    {
        textA: 'light',
        textB: 'dark',
        category: 'opposite',
        relation: 'opposite',
        explanation: 'Light and dark represent opposite levels of illumination.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.720, dotProduct: -0.660, euclideanDistance: 2.050 },
        interpretation: { label: 'These two terms point in opposite directions in this demo.', summary: 'Antonyms representing opposite levels of visibility.' }
    },

    // Unrelated
    {
        textA: 'water',
        textB: 'rock',
        category: 'unrelated',
        relation: 'unrelated',
        explanation: 'Water and rock have no direct semantic relation.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.085, dotProduct: 0.045, euclideanDistance: 1.480 },
        interpretation: { label: 'These two terms are mostly unrelated.', summary: 'Near-orthogonal vectors with little to no overlapping context.' }
    },
    {
        textA: 'sky',
        textB: 'shoes',
        category: 'unrelated',
        relation: 'unrelated',
        explanation: 'Sky and shoes belong to entirely distinct categories with no connection.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.012, dotProduct: -0.005, euclideanDistance: 1.550 },
        interpretation: { label: 'These two terms are mostly unrelated.', summary: 'Almost perfectly orthogonal vectors pointing in unrelated directions.' }
    },
    {
        textA: 'coffee',
        textB: 'brick',
        category: 'unrelated',
        relation: 'unrelated',
        explanation: 'Coffee is a beverage, brick is a building material.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.034, dotProduct: 0.012, euclideanDistance: 1.510 },
        interpretation: { label: 'These two terms are mostly unrelated.', summary: 'Orthogonal vectors representing unrelated domains.' }
    },
    {
        textA: 'sleep',
        textB: 'metal',
        category: 'unrelated',
        relation: 'unrelated',
        explanation: 'Sleep is a state of rest, metal is a chemical element class.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: -0.042, dotProduct: -0.018, euclideanDistance: 1.590 },
        interpretation: { label: 'These two terms are mostly unrelated.', summary: 'Orthogonal vectors representing distinct concepts.' }
    },
    {
        textA: 'music',
        textB: 'grape',
        category: 'unrelated',
        relation: 'unrelated',
        explanation: 'Music is an art form, grape is a fruit.',
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.015, dotProduct: 0.005, euclideanDistance: 1.530 },
        interpretation: { label: 'These two terms are mostly unrelated.', summary: 'Orthogonal vectors representing unrelated concepts.' }
    }
];

// Add 25 Spelling Similar, Meaning Different Examples
const spellingPairs = [
    { a: 'meat', b: 'meet', desc: 'Meat refers to animal flesh; meet means to encounter someone.' },
    { a: 'plain', b: 'plane', desc: 'Plain means simple or flat land; plane refers to an airplane or geometric flat surface.' },
    { a: 'there', b: 'their', desc: 'There refers to a location; their is a possessive pronoun.' },
    { a: 'here', b: 'hear', desc: 'Here indicates a nearby place; hear is the act of perceiving sound.' },
    { a: 'principal', b: 'principle', desc: 'Principal refers to a school head or primary thing; principle is a fundamental truth.' },
    { a: 'affect', b: 'effect', desc: 'Affect is a verb meaning to influence; effect is a noun meaning the result.' },
    { a: 'accept', b: 'except', desc: 'Accept means to receive; except means excluding.' },
    { a: 'complement', b: 'compliment', desc: 'Complement means to complete or match; compliment is an expression of praise.' },
    { a: 'lose', b: 'loose', desc: 'Lose means to misplace; loose is the opposite of tight.' },
    { a: 'write', b: 'right', desc: 'Write is to produce text; right is the opposite of wrong or left.' },
    { a: 'peace', b: 'piece', desc: 'Peace is tranquility; piece is a portion of something.' },
    { a: 'weather', b: 'whether', desc: 'Weather is atmospheric conditions; whether is a conjunction for choices.' },
    { a: 'desert', b: 'dessert', desc: 'Desert is dry sandy land; dessert is a sweet food eaten after a meal.' },
    { a: 'visual', b: 'virtual', desc: 'Visual relates to sight; virtual refers to something simulated digitally.' },
    { a: 'spelling', b: 'spilling', desc: 'Spelling is writing letters of words; spilling is liquid overflowing.' },
    { a: 'byte', b: 'bite', desc: 'Byte is a digital unit of data; bite is to cut with teeth.' },
    { a: 'cache', b: 'cash', desc: 'Cache is hidden storage; cash refers to physical money.' },
    { a: 'host', b: 'ghost', desc: 'Host is a person welcoming guests; ghost is a phantom/apparition.' },
    { a: 'code', b: 'cold', desc: 'Code is programming instructions; cold is a low temperature.' },
    { a: 'script', b: 'strip', desc: 'Script is written dialogue/code; strip means to remove coverings.' },
    { a: 'array', b: 'arrow', desc: 'Array is an ordered list of elements; arrow is a pointed projectile or symbol.' },
    { a: 'loop', b: 'pool', desc: 'Loop is a repeating cycle; pool is a body of water or game.' },
    { a: 'stack', b: 'stock', desc: 'Stack is a neat pile; stock refers to share certificates or supply of goods.' },
    { a: 'query', b: 'queen', desc: 'Query is a question or database search; queen is a female monarch.' },
    { a: 'stationary', b: 'stationery', desc: 'Stationary means not moving; stationery refers to writing materials.' }
];

spellingPairs.forEach(p => {
    MOCK_EXAMPLES.push({
        textA: p.a,
        textB: p.b,
        category: 'spelling_similar_meaning_different',
        relation: 'unrelated',
        explanation: `${p.desc} Despite spelling similarity, they are semantically unrelated.`,
        disclaimer: 'Calculated using static embedding vectors.',
        metrics: { cosineSimilarity: 0.045, dotProduct: 0.015, euclideanDistance: 1.890 },
        interpretation: { label: 'These two terms are mostly unrelated.', summary: 'Spelling similarity does not translate to semantic meaning.' }
    });
});

/**
 * Fetch all supported categories
 * GET /categories
 */
async function fetchVectorCategories() {
    try {
        const response = await fetch(`${VECTOR_API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn('API connection failed, using local fallback categories');
        return { categories: MOCK_CATEGORIES };
    }
}

/**
 * Fetch examples
 * GET /examples
 * Params: category, relation, limit
 */
async function fetchVectorExamples({ category, relation, limit } = {}) {
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (relation) params.append('relation', relation);
        if (limit) params.append('limit', limit);

        const url = `${VECTOR_API_BASE_URL}/examples${params.toString() ? '?' + params.toString() : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn('API connection failed, using local fallback examples');
        
        let filtered = [...MOCK_EXAMPLES];
        if (category) {
            filtered = filtered.filter(ex => ex.category === category);
        }
        if (relation) {
            filtered = filtered.filter(ex => ex.relation === relation);
        }
        if (limit) {
            filtered = filtered.slice(0, limit);
        }
        return filtered;
    }
}

/**
 * Compare textA and textB
 * POST /compare
 * Request body: { textA, textB }
 */
async function compareVectorTexts(textA, textB) {
    try {
        const response = await fetch(`${VECTOR_API_BASE_URL}/compare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ textA, textB })
        });
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const error = new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }
        
        return await response.json();
    } catch (error) {
        // If it's a 422 error from the server (meaning custom pair not in remote database), propagate it!
        if (error.status === 422) {
            throw error;
        }
        
        console.warn('API comparison connection failed, trying local fallback comparison');
        
        // Find match in MOCK_EXAMPLES (order independent)
        const match = MOCK_EXAMPLES.find(ex => 
            (ex.textA.toLowerCase() === textA.toLowerCase() && ex.textB.toLowerCase() === textB.toLowerCase()) ||
            (ex.textA.toLowerCase() === textB.toLowerCase() && ex.textB.toLowerCase() === textA.toLowerCase())
        );
        
        if (match) {
            return match;
        } else {
            // Check if we can simulate similarity for custom text inputs locally
            // Return 422 error with supported list as fallback suggestions
            const err = new Error("This pair is not in the demo dataset");
            err.status = 422;
            err.data = {
                supportedExamples: MOCK_EXAMPLES.slice(0, 8).map(ex => ({ textA: ex.textA, textB: ex.textB }))
            };
            throw err;
        }
    }
}

// Expose functions globally for script.js
window.VectorSimilarityAPI = {
    fetchVectorCategories,
    fetchVectorExamples,
    compareVectorTexts
};
