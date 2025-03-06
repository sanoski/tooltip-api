(async function() {
    const API_URL = "https://tooltip-api.onrender.com/verse"; // Your live API URL

    // List of Bible books to match
    const bibleBooks = [
        "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
        "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
        "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
        "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
        "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
        "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
        "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
        "Zephaniah", "Haggai", "Zechariah", "Malachi",
        "Matthew", "Mark", "Luke", "John", "Acts",
        "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
        "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
        "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
        "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
        "1 John", "2 John", "3 John", "Jude", "Revelation"
    ];

    function createTooltip() {
        const tooltip = document.createElement("div");
        tooltip.id = "bible-tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "#fff8dc";
        tooltip.style.border = "2px solid #d4a017";
        tooltip.style.padding = "10px";
        tooltip.style.display = "none";
        tooltip.style.width = "250px";
        tooltip.style.boxShadow = "3px 3px 8px rgba(0,0,0,0.3)";
        tooltip.style.fontFamily = "Arial, sans-serif";
        tooltip.style.borderRadius = "8px";
        tooltip.style.zIndex = "9999";
        document.body.appendChild(tooltip);
        return tooltip;
    }

    function findBibleReferences(text) {
        const regex = new RegExp(`\\b(${bibleBooks.join("|")})\\s+(\\d+):(\\d+)\\b`, "g");
        return [...text.matchAll(regex)];
    }

    function replaceBibleReferences(node) {
        if (node.nodeType !== 3) return; // Only process text nodes
        const matches = findBibleReferences(node.nodeValue);
        if (!matches.length) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach(match => {
            const [fullMatch, book, chapter, verse] = match;
            const beforeText = node.nodeValue.substring(lastIndex, match.index);
            const refSpan = document.createElement("span");
            refSpan.textContent = fullMatch;
            refSpan.className = "bible-tooltip-ref";
            refSpan.dataset.book = book;
            refSpan.dataset.chapter = chapter;
            refSpan.dataset.verse = verse;
            refSpan.style.color = "blue";
            refSpan.style.cursor = "pointer";
            refSpan.style.textDecoration = "underline";

            fragment.appendChild(document.createTextNode(beforeText));
            fragment.appendChild(refSpan);
            lastIndex = match.index + fullMatch.length;
        });

        fragment.appendChild(document.createTextNode(node.nodeValue.substring(lastIndex)));
        node.replaceWith(fragment);
    }

    function addTooltipEvents() {
        const tooltip = createTooltip();
        document.addEventListener("mouseover", async function(event) {
            if (!event.target.classList.contains("bible-tooltip-ref")) return;
            const { book, chapter, verse } = event.target.dataset;

            try {
                const response = await fetch(`${API_URL}?book=${book}&chapter=${chapter}&verse=${verse}`);
                const data = await response.json();
                if (data.text) {
                    tooltip.innerHTML = `<b>${data.book} ${data.chapter}:${data.verse}</b><br>${data.text}<br><i>${data.credit}</i>`;
                    tooltip.style.display = "block";
                    tooltip.style.left = event.pageX + "px";
                    tooltip.style.top = event.pageY + "px";
                }
            } catch (error) {
                console.error("Error fetching verse:", error);
            }
        });

        document.addEventListener("mouseout", function(event) {
            if (event.target.classList.contains("bible-tooltip-ref")) {
                tooltip.style.display = "none";
            }
        });
    }

    function scanAndReplaceTextNodes() {
        document.body.childNodes.forEach(node => replaceBibleReferences(node));
    }

    // Initialize
    document.addEventListener("DOMContentLoaded", function() {
        scanAndReplaceTextNodes();
        addTooltipEvents();
    });
})();
