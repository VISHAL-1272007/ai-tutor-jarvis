module.exports = (req, res) => {
    res.json({ status: 'AI Tutor with Groq API!', timestamp: new Date().toISOString() });
};
