// Get the form and file field
let form = document.querySelector('#upload');
let file = document.querySelector('#gcodeFile');

function getReplacedFileName(oldName) {
    let parts = oldName.split('.');
    parts[0] += '_plotter';
    return parts.join('.');
}

/**
 * Log the uploaded file to the console
 * @param {event} Event The file loaded event
 */
function logFile (event, fileName) {
    let plungeGcodeLines = document.querySelector('#plungeGcode').value.split('\n');
    let retractGcodeLines = document.querySelector('#retractGcode').value.split('\n');
    let str = event.target.result;
    let isInPath = false;
    let changedLines = [];
    let originalLines = str.split('\n');
    for (let lineIndex = 0; lineIndex < originalLines.length; lineIndex++) {
        let skipLine = false;
        let line = originalLines[lineIndex];

        if (line.startsWith('; Operation: ')) {
            isInPath = false;
        }

        if (line.startsWith('; Path ')) {
            isInPath = true;
        }

        if (!isInPath && line.startsWith('; Retract')) {
            lineIndex += 1;
            continue;
        }

        changedLines.push(line);

        if (line.startsWith('; plunge')) {
            changedLines.push(...plungeGcodeLines);
            lineIndex += 1;
        }

        if (line.startsWith('; Retract')) {
            changedLines.push(...retractGcodeLines);
            lineIndex += 1;
        }
    }

    let data = new Blob([changedLines.join('\n')], { type: 'text/plain' });
    let textFile = window.URL.createObjectURL(data);

    let link = document.createElement('a');
    link.setAttribute('download', getReplacedFileName(fileName));
    link.href = textFile;

    window.requestAnimationFrame(function() {
        let event = new MouseEvent('click');
        link.dispatchEvent(event);
//        document.body.removeChild(link);
    });
}

/**
 * Handle submit events
 * @param  {Event} event The event object
 */
function handleSubmit (event) {

    // Stop the form from reloading the page
    event.preventDefault();

    // If there's no file, do nothing
    if (!file.value.length) return;

    // Create a new FileReader() object
    let reader = new FileReader();

    // Setup the callback event to run when the file is read
    reader.onload = (event) => {
        logFile(event, file.files[0].name);
    };

    // Read the file
    reader.readAsText(file.files[0]);

}

// Listen for submit events
form.addEventListener('submit', handleSubmit);