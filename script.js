//Sets initial data if the user has not opened the extension before
//Otherwise, loads saved data
// chrome.storage.sync.clear();
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
            table = document.getElementById("assignmentCalendar"),
            html = ''.concat(`<tr><th class="headers">Assignment Name</th><th class="headers">Due Date</th><th class="headers">Class</th><th class="headers">Delete?</th></tr>`),
            numAssignments = data.numCurrentAssignments,
            currentAssignmentList = data.assignmentList,
            tableErrorText = document.getElementById("tableErrorText");
        table.innerHTML = html;
        if (numAssignments > 0) {
            tableErrorText.innerHTML = "";
            for (i = 0; i < numAssignments; i++){
                var assignment = currentAssignmentList[i],
                    currentRow = ''.concat(`<tr><td class="AssignmentCell">${assignment.name}</td><td class="AssignmentCell">${assignment.date}</td><td class="AssignmentCell">${assignment.course}</td><td class="Remove"><button">REMOVE</button></td></tr>`)
                html = html.concat(currentRow);
            }
            table.innerHTML = html;
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
            nextAssignmentList = [];
        //Get's the assignment list after the current assignment is removed        
        for (i = 0; i < numAssignments-1; i++) {
            if (i != index) {
                nextAssignmentList.push(tempAssignmentList[i]);
            }
        }
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