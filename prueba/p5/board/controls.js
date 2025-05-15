window.addEventListener("DOMContentLoaded", () => {
    const controlsDiv = document.createElement("div");
    controlsDiv.id = "controls";
    controlsDiv.style.marginTop = "10px";
    controlsDiv.style.display = "flex";
    controlsDiv.style.flexDirection = "column";
    controlsDiv.style.alignItems = "center";

    const moveButtons = document.createElement("div");
    moveButtons.style.display = "grid";
    moveButtons.style.gridTemplateColumns = "repeat(3, auto)";
    moveButtons.style.gap = "5px";

    const createBtn = (label, onClick) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.onclick = onClick;
        return btn;
    };

    moveButtons.appendChild(document.createElement("div"));
    moveButtons.appendChild(createBtn("⬆️", moveUp));
    moveButtons.appendChild(document.createElement("div"));

    moveButtons.appendChild(createBtn("⬅️", moveLeft));
    moveButtons.appendChild(document.createElement("div"));
    moveButtons.appendChild(createBtn("➡️", moveRight));

    moveButtons.appendChild(document.createElement("div"));
    moveButtons.appendChild(createBtn("⬇️", moveDown));
    moveButtons.appendChild(document.createElement("div"));

    const colorSection = document.createElement("div");
    colorSection.style.marginTop = "10px";

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = "#ff0000";

    const paintButton = createBtn("🎨 Pintar", () => {
        paint(colorPicker.value);
    });

    colorSection.appendChild(colorPicker);
    colorSection.appendChild(paintButton);

    controlsDiv.appendChild(moveButtons);
    controlsDiv.appendChild(colorSection);
    document.body.appendChild(controlsDiv);
});