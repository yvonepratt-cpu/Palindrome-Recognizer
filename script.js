
// Check whether the input is a palindrome
function checkPalindrome() {

    const input = document.getElementById("userInput").value;

    const result = document.getElementById("result");
    const stackDisplay = document.getElementById("stack");
    const stepsDisplay = document.getElementById("steps");

    result.className = "";
    result.textContent = "";

    stackDisplay.innerHTML = "";
    stepsDisplay.innerHTML = "";

    if (input.length === 0) {

        result.textContent = "Please enter a sequence.";
        result.className = "result rejected";

        return;
    }

    // Convert input into individual Unicode characters
    const characters = Array.from(input);

    const n = characters.length;

    let accepted = false;
    let successfulTrace = null;

    // Try possible middle positions
    for (let middle = 0; middle <= n; middle++) {

        // EVEN-LENGTH PALINDROME
        let stack = [];
        let trace = [];

        trace.push("State q1: Push first half into stack.");

        for (let i = 0; i < middle; i++) {

            stack.push(characters[i]);

            trace.push(
                "Push '" + characters[i] + "' into stack."
            );
        }

        trace.push("State q2: Start matching characters.");

        let match = true;

        for (let i = middle; i < n; i++) {

            const current = characters[i];
            const top = stack[stack.length - 1];

            if (top === current) {

                stack.pop();

                trace.push(
                    "Match '" + current + "'. Pop from stack."
                );

            } else {

                match = false;

                trace.push(
                    "Mismatch: '" + current +
                    "' does not match the stack top."
                );

                break;
            }
        }

        if (match && stack.length === 0) {

            accepted = true;

            successfulTrace = {
                trace: trace,
                stack: stack
            };

            break;
        }

        // ODD-LENGTH PALINDROME
        if (middle < n) {

            stack = [];
            trace = [];

            trace.push("State q1: Push first half into stack.");

            for (let i = 0; i < middle; i++) {

                stack.push(characters[i]);

                trace.push(
                    "Push '" + characters[i] + "' into stack."
                );
            }

            trace.push(
                "Skip middle character '" +
                characters[middle] + "'."
            );

            trace.push("State q2: Start matching characters.");

            match = true;

            for (let i = middle + 1; i < n; i++) {

                const current = characters[i];
                const top = stack[stack.length - 1];

                if (top === current) {

                    stack.pop();

                    trace.push(
                        "Match '" + current + "'. Pop from stack."
                    );

                } else {

                    match = false;

                    trace.push(
                        "Mismatch: '" + current +
                        "' does not match the stack top."
                    );

                    break;
                }
            }

            if (match && stack.length === 0) {

                accepted = true;

                successfulTrace = {
                    trace: trace,
                    stack: stack
                };

                break;
            }
        }
    }

    // Display result
    if (accepted) {

        result.textContent = "✓ ACCEPTED - Palindrome";
        result.className = "result accepted";

        stackDisplay.innerHTML =
            "Empty (All symbols matched)";

        successfulTrace.trace.push(
            "State q3: Input completely processed. ACCEPTED."
        );

        showSteps(successfulTrace.trace);

    } else {

        result.textContent = "✗ NOT ACCEPTED - Not a Palindrome";
        result.className = "result rejected";

        stackDisplay.innerHTML =
            "No accepting computation";

        stepsDisplay.innerHTML =
            "<div class='step'>" +
            "All possible middle positions were checked." +
            "</div>" +
            "<div class='step'>" +
            "No computation branch matched all characters." +
            "</div>" +
            "<div class='step'>" +
            "Input rejected." +
            "</div>";
    }
}

// Display PDA processing steps
function showSteps(trace) {

    const stepsDisplay = document.getElementById("steps");

    stepsDisplay.innerHTML = "";

    trace.forEach((step, index) => {

        const div = document.createElement("div");

        div.className = "step";

        div.textContent = (index + 1) + ". " + step;

        stepsDisplay.appendChild(div);

    });
}

// Insert an example into the input field
function setExample(value) {

    document.getElementById("userInput").value = value;

    checkPalindrome();
}

// Clear all fields
function clearAll() {

    document.getElementById("userInput").value = "";

    document.getElementById("result").textContent = "";
    document.getElementById("result").className = "";

    document.getElementById("stack").textContent = "Empty";

    document.getElementById("steps").textContent =
        "Enter a sequence and click Check String.";

}