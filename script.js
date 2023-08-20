// Get the form and file field
let form = document.querySelector('#upload');
let file = document.querySelector('#file');

function writePlunge(lines) {
    lines.push('plunging');
}

function writeRetract(lines) {
    lines.push('retracting');
}

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
    let str = event.target.result;
    let isInPath = false;
    let changedLines = [];
    for (line of str.split('\n')) {

        changedLines.push(line);

        if (line.startsWith('; Operation: ')) {
            isInPath = false;
        }

        if (line.startsWith('; Path ')) {
            isInPath = true;
        }

        if (isInPath && line.startsWith('; plunge')) {
            writePlunge(changedLines);
        }

        if (isInPath && line.startsWith('; Retract')) {
            writeRetract(changedLines);
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