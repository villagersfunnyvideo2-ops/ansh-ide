const express = require('express');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// API Endpoint to run Python & JS code
app.post('/api/run', async (req, res) => {
    const { filename, code } = req.body;
    const tempDir = path.join(__dirname, 'temp');

    try {
        await fs.ensureDir(tempDir);
        const tempPath = path.join(tempDir, filename);
        await fs.writeFile(tempPath, code, 'utf8');

        let command = '';
        if (filename.endsWith('.py')) {
            command = `python3 "${tempPath}" || python "${tempPath}"`;
        } else if (filename.endsWith('.js')) {
            command = `node "${tempPath}"`;
        } else {
            await fs.remove(tempPath);
            return res.json({ output: 'HTML View updated successfully in Live Panel.' });
        }

        exec(command, { timeout: 8000 }, async (error, stdout, stderr) => {
            await fs.remove(tempPath);
            res.json({ output: stdout || stderr || (error ? error.message : "Execution finished.") });
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
