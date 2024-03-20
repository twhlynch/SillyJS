function generatePerlinNoise(width, height, persistence, octaves) {
    // Initialize the noise grid
    let noiseGrid = [];
    for (let i = 0; i < width; i++) {
        noiseGrid[i] = [];
        for (let j = 0; j < height; j++) {
            noiseGrid[i][j] = 0;
        }
    }

    // Function to interpolate between two points
    function interpolate(a, b, x) {
        let ft = x * Math.PI;
        let f = (1 - Math.cos(ft)) * 0.5;
        return a * (1 - f) + b * f;
    }

    // Generate smooth noise
    function generateSmoothNoise(baseNoise, octave) {
        let smoothNoise = [];
        let samplePeriod = 1 << octave; // calculates 2 ^ k
        let sampleFrequency = 1 / samplePeriod;
        for (let i = 0; i < width; i++) {
            smoothNoise[i] = [];
            let sample_i0 = Math.floor(i / samplePeriod) * samplePeriod;
            let sample_i1 = (sample_i0 + samplePeriod) % width;
            let horizontal_blend = (i - sample_i0) * sampleFrequency;
            for (let j = 0; j < height; j++) {
                let sample_j0 = Math.floor(j / samplePeriod) * samplePeriod;
                let sample_j1 = (sample_j0 + samplePeriod) % height;
                let vertical_blend = (j - sample_j0) * sampleFrequency;
                let top = interpolate(baseNoise[sample_i0][sample_j0], baseNoise[sample_i1][sample_j0], horizontal_blend);
                let bottom = interpolate(baseNoise[sample_i0][sample_j1], baseNoise[sample_i1][sample_j1], horizontal_blend);
                smoothNoise[i][j] = interpolate(top, bottom, vertical_blend);
            }
        }
        return smoothNoise;
    }

    // Generate Perlin noise
    function generatePerlinNoise(baseNoise, octaves, persistence) {
        let perlinNoise = [];
        for (let i = 0; i < width; i++) {
            perlinNoise[i] = [];
            for (let j = 0; j < height; j++) {
                perlinNoise[i][j] = 0;
            }
        }
        let amplitude = 1;
        let totalAmplitude = 0;
        for (let octave = octaves - 1; octave >= 0; octave--) {
            amplitude *= persistence;
            totalAmplitude += amplitude;

            let smoothNoise = generateSmoothNoise(baseNoise, octave);

            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    perlinNoise[i][j] += smoothNoise[i][j] * amplitude;
                }
            }
        }

        // Normalization
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                perlinNoise[i][j] /= totalAmplitude;
            }
        }
        return perlinNoise;
    }

    // Generate base noise
    let baseNoise = [];
    for (let i = 0; i < width; i++) {
        baseNoise[i] = [];
        for (let j = 0; j < height; j++) {
            baseNoise[i][j] = Math.random();
        }
    }

    // Return Perlin noise
    return generatePerlinNoise(baseNoise, octaves, persistence);
}
