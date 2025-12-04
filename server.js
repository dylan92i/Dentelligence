const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// Initialisation de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 📂 SIMULATION DE TA BASE DE DONNÉES IMAGES (Fichiers locaux)
// Dans un vrai projet, ce serait une vraie Database
const IMAGE_DATABASE = [
    { src: "imagesex/S1.jpg", tags: ["dentelle", "rose", "sexy", "romantique"] },
    { src: "imagesex/S2.jpg", tags: ["rouge", "passion", "groupe", "fun"] },
    { src: "imagesex/S3.jpg", tags: ["bain", "été", "plage", "bleu"] },
    { src: "imagesex/S4.jpg", tags: ["soie", "nuit", "chic", "blanc"] },
    { src: "imagesex/S5.jpg", tags: ["sport", "confort", "gris", "casual"] },
    { src: "imagesex/S6.jpg", tags: ["fleurs", "printemps", "frais"] },
    { src: "imagesex/S7.jpg", tags: ["noir", "body", "soirée"] },
    { src: "imagesex/S8.jpg", tags: ["rose", "coeur", "saint valentin"] }
];

app.post("/analyze-trend", async (req, res) => {
    try {
        const { theme, saison } = req.body;

        // 1. Demander à l'IA de structurer la tendance (JSON)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ou gemini-pro
        
        const prompt = `
            Agis comme un directeur artistique de mode pour la marque Etam.
            Je te donne un Thème : "${theme}" et une Saison : "${saison}".
            
            Réponds UNIQUEMENT avec un objet JSON (sans markdown) contenant :
            1. "titre": Un titre court et percutant en Anglais (ex: LOVE IN PINK).
            2. "description": Un paragraphe inspirant en Français (30 mots max).
            3. "couleurs": Un tableau de 3 codes HEX correspondant à l'ambiance.
            4. "keywords": Un tableau de 5 mots-clés simples pour chercher des images.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Nettoyage du JSON (au cas où l'IA met des balises ```json)
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const trendData = JSON.parse(cleanJson);

        // 2. Logique de filtrage des images (basique pour l'instant)
        // On cherche des images locales qui matchent un peu les mots clés de l'IA
        // (Pour l'exemple, je renvoie tout le temps un mix, mais on pourrait filtrer ici)
        const selectedImages = IMAGE_DATABASE.sort(() => 0.5 - Math.random()).slice(0, 5);

        res.json({
            trend: trendData,
            images: selectedImages
        });

    } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Serveur prêt sur http://localhost:3000"));