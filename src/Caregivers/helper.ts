export const renderProgramDetails = (global_element: HTMLElement, institution: string, programName: string, contact_person: string) => {
    console.log(programName)
    global_element.innerHTML = `
      <div style="padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="text-align: center; margin-bottom: 20px;">${institution}</h2>
        <h4>${programName}</h4>
        <div>
          <p style="font-size: 12px; color: grey; text-align: left;">
            <strong>Next session:</strong> November 23, 2024
          </p>
          <!-- More details here -->
          <p style="font-size: 12px; text-align: left;">
            <strong>Contact information:</strong> ${contact_person}
          </p>
        </div>
        <button onclick="createPlan('${institution}','${programName}')" style="padding: 10px 20px; background: #1e6bd8; color: white; border-radius: 5px; cursor: pointer;">
          Create Plan
        </button>
      </div>
    `;
  };
  
  export const renderComparisonWidget = (global_element: HTMLElement, card: any, result: any[]) => {
    global_element.innerHTML = `
      <div style="padding: 20px; background: #fff; border-radius: 8px;">
        <h4>Profession Comparison</h4>
        <!-- Comparison logic here -->
      </div>
    `;
  };
  
  export const renderCarousel = async (global_element: HTMLElement, program: string) => {
    const response = await fetch("/api/programs", {
      method: "POST",
      body: JSON.stringify({ program }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
  
    global_element.innerHTML = `
      <div class="carousel">
        ${data.map((item: any) => `<div>${item.name}</div>`).join("")}
      </div>
    `;
  };
  