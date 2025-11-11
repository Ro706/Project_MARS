const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

router.post('/query', (req, res) => {
    const { query } = req.body;
    console.log('Received query:', query);

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    const pythonProcess = spawn('python', [path.join(__dirname, '..', 'node', 'rag_query.py')]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdin.write(query);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        console.log('Python stdout:', data.toString());
        stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error('Python stderr:', data.toString());
        stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
        if (code !== 0) {
            console.error('Error executing Python script:', stderr);
            return res.status(500).json({ error: 'Failed to process query', details: stderr });
        }

        try {
            const answerMatch = stdout.match(/LLM Answer:\s*([\s\S]*?)\s*Reward Score/);
            const rewardMatch = stdout.match(/Reward Score \(semantic alignment\):\s*([0-9.]+)/);

            if (answerMatch && rewardMatch) {
                const answer = answerMatch[1].trim();
                const rewardScore = parseFloat(rewardMatch[1].trim());
                console.log('Successfully parsed output:', { answer, rewardScore });
                res.json({ answer, reward_score: rewardScore });
            } else {
                console.error('Failed to parse Python script output. Full output:', stdout);
                res.status(500).json({ error: 'Failed to parse Python script output' });
            }
        } catch (error) {
            console.error('Error parsing Python script output:', error);
            res.status(500).json({ error: 'Failed to parse Python script output' });
        }
    });
});

module.exports = router;
