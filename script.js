//Sets initial data if the user has not opened the extension before
//Otherwise, loads saved data
chrome.storage.sync.getBytesInUse("assignmentCalendar", function (result) {
    if (result == 0) {
        setInitialTable();
    }
    else {
        loadTable();
    }
});

//Allows for the functions to be ran when the buttons are clicked
document.getElementById("submitButton").addEventListener("click", submitFunction);
document.getElementById("resetForm").addEventListener("click", resetForm);
document.getElementById("resetCalendar").addEventListener("click", resetAll);

/**
 * Prepares for adding assignments to the table by setting initial data
 */
function setInitialTable() {
    chrome.storage.sync.set({
        assignmentCalendar: {
            numCurrentAssignments: 0,
            numTotalAssignments: 0,
            assignmentList: []
        }
    });
    loadTable();
}

/**
 * Fills the table with the data currently saved if there is at least one assignment. Otherwise, it tells the user
 */
function loadTable() {
    chrome.storage.sync.get(function (allData) {
        var data = allData.assignmentCalendar,
            table = document.getElementById("assignmentCalendar");
        table.innerHTML = "";
        var firstRow = table.insertRow(),
            cellNameList = ["Assignment Name", "Due Date", "Class", "Delete?"];
        //Adds 4 cells to the row
        for (k = 0; k < 4; k++) {
            var tempCell = firstRow.insertCell(-1);
            tempCell.innerHTML = cellNameList[k];
            tempCell.setAttribute('class', "headers");
        }
        var numAssignments = data.numCurrentAssignments,
            currentAssignmentList = data.assignmentList,
            tableErrorText = document.getElementById("tableErrorText");
        //Updates the table if there is at least 1 assignment saved
        if (numAssignments > 0) {
            tableErrorText.innerHTML = "";
            //Creates row for each assignment with it's data and a remove option
            for (i = 0; i < numAssignments; i++) {
                var assignment = currentAssignmentList[i],
                    tempRow = table.insertRow(-1),
                    assignmentCellFill = [assignment.name, assignment.date, assignment.course, "REMOVE"],
                    classList = ["AssignmentCell", "AssignmentCell", "AssignmentCell", "Remove"];
                //Creates 4 cells and adds the data and remove option to those cells along with their classes
                for (j = 0; j < 4; j++) {
                    var tempCell = tempRow.insertCell(-1);
                    tempCell.innerHTML = assignmentCellFill[j];
                    tempCell.setAttribute('class', classList[j]);
                }
            }
            //Adds ability for remove option to remove the assignment and row when clicked
            for (var i = 1; i <= numAssignments; i++) {
                table.rows[i].cells[3].onclick = function () {
                    index = this.parentElement.rowIndex;
                    removeAssignment(index);
                };
            }
        }
        else {
            tableErrorText.innerHTML = "You Don't Have Any Current Assignments!\nAdd Assignments to this Calendar by Using the Form below";
        }
    });
}

/**
 * Deletes an assignment, updates the save data accordingly, and removes the assignment's row in the table
 * @param {number} index 
 */
function removeAssignment(index) {
    chrome.storage.sync.get(function (allData) {
        var data = allData.assignmentCalendar,
            numAssignments = data.numCurrentAssignments,
            tempAssignmentList = data.assignmentList,
            nextAssignmentList = [],
            assignment = tempAssignmentList[index - 1];
        //Get's the assignment list after the current assignment is removed
        for (i = 0; i < numAssignments; i++) {
            //
            if (i != index - 1) {
                nextAssignmentList.push(assignment);
            }
        }

        // allData.assignmentCalendar = {
        //     numCurrentAssignments: numAssignments - 1,
        //     numTotalAssignments: data.numTotalAssignments - 1,
        //     assignmentList: nextAssignmentList
        // };
        //Updates the save data
        chrome.storage.sync.set({
            assignmentCalendar: {
                numCurrentAssignments: numAssignments - 1,
                numTotalAssignments: data.numTotalAssignments - 1,
                assignmentList: nextAssignmentList
            }
        });
        var table = document.getElementById("assignmentCalendar");
        table.deleteRow(index);
        //Updates the error text if the user is deleting their last assignment
        if (numAssignments == 1) {
            document.getElementById("tableErrorText").innerHTML = "You Don't Have Any Current Assignments!\nAdd Assignments to this Calendar by Using the Form below";
        }
    });
}

/**
 * Validates form submission, and creates assignment if submission is valid
 */
function submitFunction() {
    var form = document.getElementById("form"),
        assignmentName = form[1].value,
        dueDate = form[2].value,
        assignmentClass = form[3].value,
        errorText = document.getElementById("formErrorText");
    //Validates that the form has been filled out
    if (assignmentName != "" && dueDate != "" && assignmentClass != "") {
        document.getElementById("form").reset();
        chrome.storage.sync.get(function (allData) {
            var data = allData.assignmentCalendar,
                currentAssignmentList = data.assignmentList;
            currentAssignmentList.push({
                name: assignmentName,
                date: dueDate,
                course: assignmentClass,
            });
            //Updates the saved data
            chrome.storage.sync.set({
                assignmentCalendar: {
                    assignmentList: currentAssignmentList,
                    numCurrentAssignments: data.numCurrentAssignments + 1,
                    numTotalAssignments: data.numTotalAssignments + 1
                }
            });
            loadTable();
        });
    }
    else {
        //Tells user that the form is not fully filled out
        errorText.innerHTML = "All Sections of the Form Need to be Filled out before Submitting";
    }
}

/**
 * Resets the Input Fields of the form
 */
function resetForm() {
    document.getElementById("form").reset();
}

/**
 * Clears the whole calendar by deleting all in the Chrome Storage
 */
function resetAll() {
    chrome.storage.sync.get(function (allData) {
        delete allData.assignmentCalendar;
        chrome.storage.sync.set(allData);
    });
    setInitialTable();
}