(async function() {
    const API_URL = "https://tooltip-api.onrender.com/verse"; // Replace with your actual API URL

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
        const regex = /\b([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)\b/g;
        return [...text.matchAll(regex)];
    }

    function replaceBibleReferences() {
        document.body.childNodes.forEach(node => {
            if (node.nodeType !== 3) return; // Only process text nodes

            const regex = /\b([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)\b/g;
            let matches = [...node.nodeValue.matchAll(regex)];

            if (!matches.length) return;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            matches.forEach(match => {
                const [fullMatch, book, chapter, verse] = match;
                const beforeText = node.nodeValue.substring(lastIndex, match.index);

                const refSpan = document.createElement("span");
                refSpan.textContent = fullMatch;
                refSpan.className = "verse-link";
                refSpan.dataset.book = book.trim();
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
        });

        console.log("✅ Verse detection completed!");
    }

    function addTooltipEvents() {
        const tooltip = createTooltip();

        // Use event delegation to detect dynamically added elements
        document.body.addEventListener("mouseover", async function(event) {
            const target = event.target.closest(".verse-link"); // Detect dynamically added elements
            if (!target) return;

            const { book, chapter, verse } = target.dataset;

            try {
                const response = await fetch(`${API_URL}?book=${book}&chapter=${chapter}&verse=${verse}`);
                const data = await response.json();

                if (data.text) {
                    tooltip.innerHTML = `<b>${data.book} ${data.chapter}:${data.verse}</b><br>${data.text}<br><i>${data.credit}</i>`;
                    tooltip.style.display = "block";
                    tooltip.style.left = event.pageX + "px";
                    tooltip.style.top = event.pageY + 10 + "px";
                }
            } catch (error) {
                console.error("Error fetching verse:", error);
            }
        });

        document.body.addEventListener("mouseout", function(event) {
            if (event.target.classList.contains("verse-link")) {
                tooltip.style.display = "none";
            }
        });

        console.log("✅ Tooltip event listeners attached!");
    }

    // Initialize the script
    document.addEventListener("DOMContentLoaded", function() {
        replaceBibleReferences();  // Detect and wrap Bible verses
        addTooltipEvents();        // Attach event listeners
    });
})();
