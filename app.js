// Initialize Supabase
// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://hhokutlwywbrxyabzbjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob2t1dGx3eXdicnh5YWJ6YmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjI1MTIsImV4cCI6MjA3NzMzODUxMn0.T8GVvtD4Ej5scZaTboWxYu_I-IRdw8GAvD5L-eatvMM';
const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Categories and their mapping
const categories = {
    r: ['R1', 'R2'],
    i: ['I1', 'I2'],
    a: ['A1', 'A2'],
    s: ['S1', 'S2'],
    e: ['E1', 'E2'],
    c: ['C1', 'C2']
};

// Descriptions for categories
const descriptions = {
    r: "Les personnes réalistes aiment les activités concrètes et pratiques. Elles préfèrent travailler avec leurs mains et résoudre des problèmes de manière réelle. Elles sont souvent attirées par les métiers manuels, la mécanique, la construction ou l'agriculture.",
    i: "Les personnes investigatrices sont curieuses et aiment apprendre de nouvelles choses. Elles sont souvent intéressées par les sciences, les mathématiques et la recherche. Elles aiment comprendre comment les choses fonctionnent.",
    a: "Les personnes artistiques sont créatives et expressives. Elles aiment s'exprimer à travers l'art, la musique, la littérature ou le théâtre. Elles sont souvent sensibles et originales et aiment l’improvisation.",
    s: "Social : Les personnes sociales aiment aider les autres et travailler en équipe. Elles sont souvent empathiques et à l'écoute. Elles sont attirées par les métiers du soin, de l'éducation ou du service.",
    e: "Les personnes entrepreneuses sont dynamiques et aiment prendre des initiatives. Elles sont souvent ambitieuses et persuasives. Elles sont attirées par les métiers de la vente, du management ou de la politique.",
    c: "Les personnes conventionnelles sont organisées et méthodiques. Elles aiment les tâches bien définies et les structures claires. Elles sont souvent douées pour les chiffres et l'administration."
};

// Descriptions for sub-dimensions
const subDescriptions = {
    "R1": "Technique/pratique",
    "R2": "Plein air, Sport, conduite",
    "I1": "Spécialistes orientés application concrète",
    "I2": "Métiers de la recherche orientés production de connaissances",
    "A1": "Pratique artistique/expression de soi",
    "A2": "Culturel et organisationnel",
    "S1": "Santé, médical et paramédical",
    "S2": "Accompagnement/enseignement/formation",
    "E1": "Management, gestion d'équipe et métiers de l'influence",
    "E2": "Vente/négociation & marketing/publicité",
    "C1": "Gestion administrative & financière",
    "C2": "Ordre sécurité et juridique"
};

// Score mapping
const scoreMap = {
    '--': 0,
    '-': 1,
    '+': 2,
    '++': 4
};

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate questions
function generateQuestions() {
    const shuffled = shuffle([...questionsData]);
    const container = document.getElementById('questions-container');
    shuffled.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.dataset.questionIndex = index; // Add an index to track questions
        questionDiv.style.display = index === 0 ? 'block' : 'none'; // Only show first
        questionDiv.innerHTML = `
            <p><span class="profession">${question.profession}</span> <span class="info" title="${question.description}">?</span></p>
            <div class="options">
                <label><input type="radio" name="q-${question.dimension}-${index}" value="--">--</label>
                <label><input type="radio" name="q-${question.dimension}-${index}" value="-">-</label>
                <label><input type="radio" name="q-${question.dimension}-${index}" value="+">+</label>
                <label><input type="radio" name="q-${question.dimension}-${index}" value="++">++</label>
            </div>
        `;
        container.appendChild(questionDiv);

        // Add event listener to show next question
        const radios = questionDiv.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (index + 1 < shuffled.length) {
                    const nextDiv = container.children[index + 1];
                    nextDiv.style.display = 'block';
                    // Optionally scroll to next question
                    nextDiv.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // Show submit button and participant info when all questions answered
                    document.getElementById('submit-btn').style.display = 'block';
                    document.getElementById('participant-info').style.display = 'block';
                    // Scroll to info section
                    document.getElementById('participant-info').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    });
}

// Calculate scores and percentages
function calculateScoresAndPercentages() {
    const scores = {};
    const percentages = {};
    const responses = [];

    // Calculate item counts per subdimension
    const allSubcategories = Object.values(categories).flat();
    const itemCounts = {};
    allSubcategories.forEach(subcat => {
        itemCounts[subcat] = questionsData.filter(q => q.dimension === subcat).length;
    });

    // Get the profession map
    const container = document.getElementById('questions-container');
    const questionDivs = container.querySelectorAll('.question');
    const professionsMap = {};
    questionDivs.forEach((div, index) => {
        const professionSpan = div.querySelector('.profession');
        if (professionSpan) {
            professionsMap[index] = professionSpan.textContent;
        }
    });

    // Sub-dimensions
    for (const [category, subcats] of Object.entries(categories)) {
        let totalMain = 0;
        let maxMain = 0;
        for (const subcat of subcats) {
            const radios = document.querySelectorAll(`input[name^="q-${subcat}-"]:checked`);
            let totalSub = 0;
            radios.forEach(radio => {
                const value = radio.value;
                const name = radio.name;
                const match = name.match(/q-(\w+)-(\d+)/);
                if (match) {
                    const index = parseInt(match[2]);
                    const profession = professionsMap[index];
                    responses.push({
                        profession: profession,
                        dimension: subcat,
                        value: scoreMap[value]
                    });
                    totalSub += scoreMap[value];
                }
            });
            scores[subcat] = totalSub;
            const maxSub = itemCounts[subcat] * 4;
            percentages[subcat] = Math.round((totalSub / maxSub) * 10000) / 100; // round to 2 decimals
            totalMain += totalSub;
            maxMain += itemCounts[subcat];
        }
        scores[category] = totalMain;
        const maxScoreMain = maxMain * 4;
        percentages[category] = Math.round((totalMain / maxScoreMain) * 10000) / 100;
    }

    // Sort responses by profession for consistent order
    responses.sort((a, b) => a.profession.localeCompare(b.profession));

    return { scores, percentages, responses };
}

// Display results
function displayResults(percentages) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Résultats</h2>';

    // Get the profession for each question from the original shuffled order
    const container = document.getElementById('questions-container');
    const questionDivs = container.querySelectorAll('.question');
    const professionsMap = {};
    questionDivs.forEach((div, index) => {
        const professionSpan = div.querySelector('.profession');
        if (professionSpan) {
            professionsMap[index] = professionSpan.textContent;
        }
    });

    // Collect ++ professions per main category
    const excellentProfessions = {};
    Object.keys(categories).forEach(category => {
        excellentProfessions[category] = [];
    });
    const excellentRadios = document.querySelectorAll('input[value="++"]:checked');
    excellentRadios.forEach(radio => {
        const name = radio.getAttribute('name');
        const match = name.match(/q-(\w+)-(\d+)/);
        if (match) {
            const dimension = match[1];
            const index = parseInt(match[2]);
            const profession = professionsMap[index];
            // Find the main category for this sub-dimension
            const mainCategory = Object.keys(categories).find(cat =>
                categories[cat].includes(dimension)
            );
            if (mainCategory && excellentProfessions[mainCategory]) {
                excellentProfessions[mainCategory].push(profession);
            }
        }
    });

    // Display all categories in original order with main details only
    for (const [category, subcats] of Object.entries(categories)) {
        let profs = '';
        if (excellentProfessions[category] && excellentProfessions[category].length > 0) {
            profs = '<p>Métiers appréciés : ' + excellentProfessions[category].join(', ') + '</p>';
        }
        resultsDiv.innerHTML += `
            <div class="category-results">
                <h3>${category.toUpperCase()} (${percentages[category]}%) - ${descriptions[category]}</h3>
                ${profs}
            </div>
        `;
    }

    // Sort categories by percentage descending for top 3 summary
    const sortedCategories = Object.keys(percentages)
        .filter(key => key in descriptions)
        .sort((a, b) => percentages[b] - percentages[a])
        .slice(0, 3);

    const dominantProfile = sortedCategories.map(cat => cat.toUpperCase()).join(' ');
    resultsDiv.innerHTML += `<h3>Profil RIASEC dominant: ${dominantProfile}</h3>`;

    // Add radar chart
    resultsDiv.innerHTML += `
        <div class="radar-chart-container" style="text-align: center; margin: 20px 0;">
            <div style="position: relative; display: inline-block;">
                <img src="RIASEC Plan de travail 1.svg" alt="RIASEC Background" style="position: absolute; top: 0; left: 0; width: 400px; height: 400px; opacity: 0.5; z-index: 1; pointer-events: none;">
                <canvas id="riasecRadarChart" width="400" height="400" style="position: relative; z-index: 2;"></canvas>
            </div>
        </div>
    `;

    // Create radar chart after DOM update
    setTimeout(() => {
        const ctx = document.getElementById('riasecRadarChart').getContext('2d');
        const riasecData = ['R', 'I', 'A', 'S', 'E', 'C'].map(cat => percentages[cat.toLowerCase()] || 0);

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [{
                    data: riasecData,
                    borderColor: 'rgba(0, 0, 0, 1)',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(0, 0, 0, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 0, 0, 1)'
                }]
            },
            options: {
                responsive: false, // Fixed size
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            color: 'rgba(0, 0, 0, 0.8)',
                            font: {
                                size: 10
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.3)',
                            lineWidth: 1
                        },
                        angleLines: {
                            display: false // Hide angle lines from center to points
                        },
                        pointLabels: {
                            color: 'rgba(0, 0, 0, 0.8)',
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed.r + '%';
                            }
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0 // Straight lines between points
                    }
                }
            }
        });
    }, 100);
}

// Save to Supabase
async function saveResults(scores, percentages, age, sex, responses) {
    try {
        const { data, error } = await supabaseClient
            .from('riasec_results')
            .insert([
                {
                    timestamp: new Date().toISOString(),
                    scores: JSON.stringify(scores),
                    percentages: JSON.stringify(percentages),
                    responses: JSON.stringify(responses),
                    age: parseInt(age),
                    sex: sex
                }
            ]);
        if (error) throw error;
        console.log('Results saved successfully');
    } catch (error) {
        console.error('Error saving results:', error);
        // In a real app, handle errors gracefully
    }
}

// Validate form (all questions answered)
function validateForm() {
    // Remove any previous error highlighting
    const allQuestions = document.querySelectorAll('.question');
    allQuestions.forEach(q => q.classList.remove('error'));

    const totalQuestions = questionsData.length;
    const checkedRadios = document.querySelectorAll('input[type="radio"]:checked');
    const totalSelected = checkedRadios.length;

    if (totalSelected !== totalQuestions) {
        // Highlight unanswered questions in red
        const questions = document.querySelectorAll('#questions-container .question');
        const answered = new Set();
        checkedRadios.forEach(radio => {
            const name = radio.name;
            const match = name.match(/q-(\w+-\w+)-(\d+)/);
            if (match) {
                const questionIndex = parseInt(match[2]);
                answered.add(questionIndex);
            }
        });

        questions.forEach((question, shuffledIndex) => {
            if (!answered.has(shuffledIndex)) {
                question.classList.add('error');
            }
        });

        // Scroll to the first unanswered question
        const firstError = document.querySelector('.question.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth' });
        }

        return false;
    }
    return true;
}

// Main submit handler
async function handleSubmit() {
    if (!validateForm()) {
        alert('Veuillez répondre à toutes les questions.');
        return;
    }

    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    if (!age || !sex) {
        alert('Veuillez renseigner l\'âge et le sexe.');
        return;
    }

    const { scores, percentages, responses } = calculateScoresAndPercentages();
    displayResults(percentages);
    await saveResults(scores, percentages, age, sex, responses);
}

// Fill random for testing
function fillRandom() {
    const questions = document.querySelectorAll('#questions-container .question');
    questions.forEach((question, index) => {
        // Show all questions for random fill
        question.style.display = 'block';
        const radios = question.querySelectorAll('input[type="radio"]');
        // Deselect all
        radios.forEach(r => r.checked = false);
        // Choose random
        const randomIndex = Math.floor(Math.random() * radios.length);
        radios[randomIndex].checked = true;
    });
    // Show submit button
    document.getElementById('submit-btn').style.display = 'block';
}

// Reset form
function resetForm() {
    const container = document.getElementById('questions-container');
    container.innerHTML = ''; // Clear the questions
    document.getElementById('submit-btn').style.display = 'none'; // Hide submit button
    document.getElementById('participant-info').style.display = 'none'; // Hide participant info
    document.getElementById('results').innerHTML = ''; // Clear results
    document.getElementById('age').value = ''; // Clear age
    document.getElementById('sex').value = ''; // Clear sex
    generateQuestions(); // Regenerate questions with new order
}

// Hide submit button initially and add click listener to RIASEC image
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit-btn').style.display = 'none';
    generateQuestions();
    document.getElementById('fill-random').addEventListener('click', fillRandom);
    document.getElementById('reset-btn').addEventListener('click', resetForm);

    // Show test button only when RIASEC image is clicked
    const riasecImage = document.querySelector('.riasec-image');
    if (riasecImage) {
        riasecImage.addEventListener('click', () => {
            document.getElementById('fill-random').style.display = 'block';
        });
    }
});
document.getElementById('submit-btn').addEventListener('click', handleSubmit);
