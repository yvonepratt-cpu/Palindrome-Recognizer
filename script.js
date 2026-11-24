// This function is a shortcut for accessing HTML elements by ID.
// For example, $('userInput') is the same as
// document.getElementById('userInput').
const $ = id => document.getElementById(id);

// This variable identifies the current animation.
// It prevents an old animation from continuing after a reset.
let generation = 0;

// These variables count accepted and rejected strings.
let accepted = 0;
let rejected = 0;

// Converts spaces and tabs into visible symbols.
// This helps the user see invisible characters in the stack.
const display = c =>
    c === ' ' ? '␣' :
    c === '\t' ? '⇥' : c;

// PDA PALINDROME RECOGNITION LOGIC

// This function checks whether the input is a palindrome.
// It also records the operations performed by the PDA.
function buildTrace(input) {

    // Converts the input string into an array of characters.
    // Example: "madam" becomes ['m', 'a', 'd', 'a', 'm'].
    const chars = Array.from(input);

    // Creates an empty array that acts as the stack.
    // A stack follows the Last In, First Out (LIFO) principle.
    const stack = [];

    // Creates an array that stores all PDA processing steps.
    const steps = [];

    // This function records the current state, operation,
    // and contents of the stack.
    const add = (state, operation) => {

        steps.push({

            // Current state of the PDA
            state,

            // Description of the current operation
            operation,

            // Creates a copy of the current stack.
            // This prevents future changes from modifying old steps.
            stack: [...stack]

        });

    };

    // STATE q0: INITIAL STATE


    // Records the initialization of the stack.
    // The bottom marker is displayed separately in the interface.
    add('q0', 'Initialize bottom marker');

    // Finds the middle position of the input.
    // Math.floor removes the decimal part.
    // Example: 5 / 2 = 2.5, which becomes 2.
    //
    // The simulator uses the input length to select
    // a computation path of the nondeterministic PDA.
    const mid = Math.floor(chars.length / 2);

    // STATE q1: PUSH OPERATION

    // This loop reads the first half of the input.
    for (let i = 0; i < mid; i++) {

        // PUSH adds the current character to the top of the stack.
        stack.push(chars[i]);

        // Records the PUSH operation for the visualization.
        add(
            'q1',
            'PUSH ' + display(chars[i])
        );

    }

    // Indicates that the first half is stored in the stack.
    add('q1', 'First half stored');

    // TRANSITION FROM q1 TO q2

    // The modulo operator (%) checks whether the length is odd.
    //
    // Odd example: 5 % 2 = 1
    // Even example: 4 % 2 = 0
    //
    // For odd-length strings, the middle character is skipped.
    // For even-length strings, an epsilon transition is used.

    add(
        'q2',

        chars.length % 2

            // Odd-length input
            ? 'Skip middle symbol ' + display(chars[mid])

            // Even-length input
            : 'ε transition to matching state'
    );

    // STATE q2: MATCH AND POP OPERATION

    // Math.ceil rounds the number upward.
    // This allows the loop to skip the middle character
    // when the input has an odd number of characters.

    for (
        let i = Math.ceil(chars.length / 2);
        i < chars.length;
        i++
    ) {

        // Gets the character at the top of the stack.
        // The last element of the array is the top of the stack.
        const top = stack[stack.length - 1];

        // Compares the current input character with the stack top.
        // !== means the two values are not equal.
        if (chars[i] !== top) {

            // Records the characters that did not match.
            add(
                'q2',

                'Mismatch: ' +
                display(chars[i]) +
                ' ≠ ' +
                display(top)
            );

            // Returns false because the input is not a palindrome.
            // The function stops immediately after a mismatch.
            return {
                steps,
                ok: false
            };

        }

        // POP removes the top character from the stack
        // when the two characters match.
        stack.pop();

        // Records the successful matching and POP operation.
        add(
            'q2',
            'MATCH and POP ' + display(chars[i])
        );

    }

    // STATE q3: ACCEPTING STATE

    // The string is accepted if all input characters
    // have been processed and the stack is empty.
    if (stack.length === 0) {

        // Records the final accepting state.
        add(
            'q3',
            'Input consumed; only bottom marker remains'
        );

        // Returns true because the input is a palindrome.
        return {
            steps,
            ok: true
        };

    }

    // Rejects the input if unmatched characters remain.
    add('q2', 'Unmatched characters remain in the stack');

    return {
        steps,
        ok: false
    };

}

// DISPLAY PDA OPERATIONS

// This function displays one processing step
// in the state diagram, stack and processing table.
function render(step, index) {

    // Selects all circles inside the PDA state diagram.
    document
        .querySelectorAll('.states span')
        .forEach(el => {

            // Adds the active class to the current state.
            // Removes it from the other states.
            el.classList.toggle(
                'active',
                el.id === step.state
            );

        });

    // Removes the previous stack display.
    $('stack').replaceChildren();

    // Creates a reversed copy of the stack so the
    // top character appears above the other characters.
    [...step.stack]

        .reverse()

        // Converts invisible characters into visible symbols.
        .map(display)

        // Adds the bottom marker to the displayed stack.
        .concat('⊥')

        .forEach(c => {

            // Creates a new HTML span for each stack character.
            const el = document.createElement('span');

            // Sets the character displayed inside the span.
            el.textContent = c;

            // Adds the span to the stack container.
            $('stack').append(el);

        });

    // Displays the description of the current operation.
    $('operation').textContent = step.operation;

    // Creates a new row in the processing trace table.
    const row = $('trace').insertRow();

    // Creates the values that will appear in the table columns.
    [
        // Step number starts at 1 instead of 0.
        index + 1,

        // Current PDA state.
        step.state,

        // Current PUSH, POP or transition operation.
        step.operation,

        // Current stack contents from bottom to top.
        ['⊥', ...step.stack.map(display)].join(' · ')

    ].forEach(value => {

        // Creates a table cell and inserts its value.
        row.insertCell().textContent = value;

    });

    // Finds the scrollable table container.
    const wrap = $('trace').closest('.tablewrap');

    // Automatically scrolls to the latest processing step.
    wrap.scrollTop = wrap.scrollHeight;

}

// CHECK PALINDROME FUNCTION

// This function runs when the Check String button is clicked.
// async allows the function to wait between animation steps.
async function checkPalindrome() {

    // Creates an identifier for the current animation.
    const token = ++generation;

    // Retrieves the sequence entered by the user.
    const input = $('userInput').value;

    // Disables the Check String button while processing.
    // This prevents multiple animations from running together.
    $('check').disabled = true;

    // Disables the input while the current sequence is processing.
    $('userInput').disabled = true;

    // Clears the previous processing trace.
    $('trace').replaceChildren();

    // Removes the previous accepted or rejected styling.
    $('result').className = 'result';

    // Displays a temporary processing message.
    $('result').textContent = 'Processing…';

    // Calls the recognition function.
    // steps contains the PDA operations.
    // ok contains true for accepted or false for rejected.
    const { steps, ok } = buildTrace(input);

    // ANIMATION LOOP

    // Displays each PDA processing step one at a time.
    for (let i = 0; i < steps.length; i++) {

        // Stops the animation if the user clicks Reset.
        if (token !== generation) {
            return;
        }

        // Displays the current processing step.
        render(steps[i], i);

        // Waits before displaying the next step.
        // The delay depends on the animation speed slider.
        await new Promise(resolve => {

            setTimeout(
                resolve,

                // Converts the slider value into a number.
                Number($('speed').value)
            );

        });

    }

    // Prevents a cancelled animation from changing the result.
    if (token !== generation) {
        return;
    }

    // DISPLAY FINAL RESULT

    // Adds the accepted or rejected CSS class.
    // The ternary operator selects a value based on a condition.
    $('result').className =
        'result ' + (ok ? 'accepted' : 'rejected');

    // Displays the final recognition result.
    // Empty input is displayed using the epsilon symbol.
    $('result').textContent =

        (
            ok
                ? 'Accepted — Palindrome'
                : 'Rejected — Not a palindrome'

        ) + ' : ' + (input || 'ε');

    // UPDATE STATISTICS

    // Increases the accepted counter if the input is a palindrome.
    if (ok) {

        accepted++;

    } else {

        // Increases the rejected counter otherwise.
        rejected++;

    }

    // Updates the accepted count in the HTML.
    $('good').textContent = accepted;

    // Updates the rejected count in the HTML.
    $('bad').textContent = rejected;

    // Calculates the total number of completed tests.
    $('total').textContent = accepted + rejected;

    // Enables the Check String button again.
    $('check').disabled = false;

    // Allows the user to enter another sequence.
    $('userInput').disabled = false;

}

// RESET FUNCTION

// This function clears the current input and visualization.
// It keeps the statistics so the user can perform more tests.
function reset() {

    // Changes the animation identifier to stop the current animation.
    generation++;

    // Enables the Check String button.
    $('check').disabled = false;

    // Enables the input field.
    $('userInput').disabled = false;

    // Clears the user's input.
    $('userInput').value = '';

    // Removes all rows from the processing table.
    $('trace').replaceChildren();

    // Restores the default result styling.
    $('result').className = 'result';

    // Restores the default result message.
    $('result').textContent =
        'Ready to process a sequence.';

    // Removes all displayed stack characters.
    $('stack').replaceChildren();

    // Creates the bottom marker again.
    const bottom = document.createElement('span');

    bottom.textContent = '⊥';

    // Adds the bottom marker to the empty stack display.
    $('stack').append(bottom);

    // Restores the default operation message.
    $('operation').textContent = 'Waiting for input';

    // Removes the highlight from all PDA states.
    document
        .querySelectorAll('.states span')
        .forEach(el => {

            el.classList.remove('active');

        });

    // Places the cursor back inside the input field.
    $('userInput').focus();

}

// EXAMPLE INPUT BUTTONS

// This array contains sample accepted and rejected strings.
[
    'madam',
    '12321',
    'abba',
    '@a@',
    'abcba',
    '1234',
    'aabb',
    'Madam'

].forEach(value => {

    // Creates a button for each example.
    const button = document.createElement('button');

    // Displays the example string on the button.
    button.textContent = value;

    // Runs when the user clicks an example button.
    button.onclick = () => {

        // Clears the previous test.
        reset();

        // Automatically places the example in the input field.
        $('userInput').value = value;

    };

    // Adds the example button to the HTML examples container.
    $('examples').append(button);

});

// EVENT HANDLERS

// Calls checkPalindrome when the Check String button is clicked.
$('check').onclick = checkPalindrome;

// Calls reset when the Reset button is clicked.
$('clear').onclick = reset;

// Updates the displayed animation delay whenever
// the user moves the speed slider.
$('speed').oninput = () => {

    $('delay').textContent =
        $('speed').value + ' ms';

};

// Allows the user to press Enter instead of
// clicking the Check String button.
$('userInput').onkeydown = event => {

    // Checks whether Enter was pressed
    // and whether the Check String button is enabled.
    if (
        event.key === 'Enter' &&
        !$('check').disabled
    ) {

        // Starts the palindrome recognition process.
        checkPalindrome();

    }

};
