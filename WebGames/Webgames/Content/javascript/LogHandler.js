﻿var loggingSeverity = {
    none: 0,
    errors: 1,
    information: 2,
    verbose: 3
}

var loggingLevel = loggingSeverity.information;

function logMessage(severity, message) {
    if (severity <= loggingLevel) {
        console.log(message);
    }
}