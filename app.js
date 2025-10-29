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
    r: "Ce type R est souvent associé à des personnes qui aiment travailler avec des objets, des machines ou des animaux. Elles préfèrent les activités pratiques et concrètes, en intérieur ou en extérieur, dans un environnement naturel, et apprécient les tâches qui nécessitent des compétences techniques et un engagement physique.",
    i: "Les individus de ce type I sont souvent curieux, analytiques et aiment résoudre des problèmes. Ils préfèrent les tâches intellectuelles et scientifiques, souvent liées à la recherche et à l'analyse de données.",
    a: "Ce type A est caractérisé par la créativité et l'expression personnelle. Les personnes artistiques aiment plutôt travailler dans des environnements non structurés et sont attirées par les arts, la musique, l'écriture et d'autres formes d'expression créative.",
    s: "Les individus de ce type S sont orientés vers les autres. Ils aiment aider, enseigner ou soigner et apprécient de travailler en équipe. Les professions dans le domaine de la santé, de l'éducation et du service à la personne les attirent souvent.",
    e: "Ce type E est associé à des personnes qui aiment diriger, persuader et influencer les autres. Elles ont le goût du challenge et aiment prendre des risques, ce qui les conduit vers des carrières en affaires et en gestion.",
    c: "Les personnes de ce type C préfèrent les environnements structurés et organisés. Elles aiment suivre des règles et des procédures, et sont souvent attirées par des métiers dans la comptabilité, le secrétariat, l'administration, le juridique, le maintien de l'ordre ou d'autres domaines où la précision est essentielle."
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

    // Calculate item counts per subdimension
    const allSubcategories = Object.values(categories).flat();
    const itemCounts = {};
    allSubcategories.forEach(subcat => {
        itemCounts[subcat] = questionsData.filter(q => q.dimension === subcat).length;
    });

    // Sub-dimensions
    for (const [category, subcats] of Object.entries(categories)) {
        let totalMain = 0;
        let maxMain = 0;
        for (const subcat of subcats) {
            const radios = document.querySelectorAll(`input[name^="q-${subcat}-"]:checked`);
            let totalSub = 0;
            radios.forEach(radio => {
                totalSub += scoreMap[radio.value];
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

    return { scores, percentages };
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

    // Collect ++ professions per sub-dimension
    const excellentProfessions = {};
    Object.keys(categories).forEach(category => {
        categories[category].forEach(subcat => {
            excellentProfessions[subcat] = [];
        });
    });
    const excellentRadios = document.querySelectorAll('input[value="++"]:checked');
    excellentRadios.forEach(radio => {
        const name = radio.getAttribute('name');
        const match = name.match(/q-(\w+)-(\d+)/);
        if (match) {
            const dimension = match[1];
            const index = parseInt(match[2]);
            const profession = professionsMap[index];
            if (excellentProfessions[dimension]) {
                excellentProfessions[dimension].push(profession);
            }
        }
    });

    // Display all categories in original order with full details
    for (const [category, subcats] of Object.entries(categories)) {
        let subcatDetails = '';
        subcats.forEach(subcat => {
            let profs = '';
            if (excellentProfessions[subcat] && excellentProfessions[subcat].length > 0) {
                profs += ' - Métiers appréciés : ' + excellentProfessions[subcat].join(', ');
            }
            subcatDetails += `<p>${subcat.toUpperCase()}: ${percentages[subcat]}% (${subDescriptions[subcat]})${profs}</p>`;
        });
        resultsDiv.innerHTML += `
            <div class="category-results">
                <h3>${category.toUpperCase()} (${percentages[category]}%) - ${descriptions[category]}</h3>
                ${subcatDetails}
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
}

// Save to Supabase
async function saveResults(scores, percentages, age, sex) {
    try {
        const { data, error } = await supabaseClient
            .from('riasec_results')
            .insert([
                {
                    timestamp: new Date().toISOString(),
                    scores: JSON.stringify(scores),
                    percentages: JSON.stringify(percentages),
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

    const { scores, percentages } = calculateScoresAndPercentages();
    displayResults(percentages);
    await saveResults(scores, percentages, age, sex);
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

// Hide submit button initially
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submit-btn').style.display = 'none';
    generateQuestions();
    document.getElementById('fill-random').addEventListener('click', fillRandom);
    document.getElementById('reset-btn').addEventListener('click', resetForm);
});
document.getElementById('submit-btn').addEventListener('click', handleSubmit);
