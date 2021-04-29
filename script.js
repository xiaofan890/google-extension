// chrome.storage.sync.clear();
chrome.storage.sync.getBytesInUse("testFirstTime", function(result) {
    if(result==0){
        setInitialTable();
    }else{
        loadTable();
    }
});

document.getElementById("submitButton").addEventListener("click", submitFunction);
document.getElementById("resetForm").addEventListener("click", resetForm);
document.getElementById("resetCalendar").addEventListener("click", resetAll);


function setInitialTable() {
    var tempVar = 0;
    var initialSave = {
        numCurrentAssignments: tempVar,
        numTotalAssignments: tempVar,
        testFirstTime: tempVar,
        assignmentList: []
    };
    chrome.storage.sync.set(initialSave,function(){} );
    loadTable();
}

function loadTable() {
    chrome.storage.sync.get(function(data){
        var table = document.getElementById("assignmentCalendar");
        table.innerHTML = "";
        var firstRow = table.insertRow();
        var cell1 = firstRow.insertCell(-1);
        var cell2 = firstRow.insertCell(-1);
        var cell3 = firstRow.insertCell(-1);
        var cell4 = firstRow.insertCell(-1);
        cell1.innerHTML="Assignment Name";
        cell2.innerHTML="Due Date";
        cell3.innerHTML="Class";
        cell4.innerHTML="Delete?";

        var first = document.getElementById("assignmentCalendar").rows[0];
        var Cell1=first.cells[0],Cell2=first.cells[1],Cell3=first.cells[2],Cell4=first.cells[3];
        Cell1.setAttribute("class", "headers");
        Cell2.setAttribute("class", "headers");
        Cell3.setAttribute("class", "headers");
        Cell4.setAttribute("class", "headers");

        var numAssignments = data.numCurrentAssignments;
        var currentAssignmentList = data.assignmentList;
        var tableErrorText = document.getElementById("tableErrorText");
        if(numAssignments > 0){
            tableErrorText.innerHTML="";
            for(i=0; i<numAssignments;i++){
                var assignment = currentAssignmentList[i];
                var tempRow = table.insertRow(-1);
                var tempCell1 = tempRow.insertCell(-1);
                var tempCell2 = tempRow.insertCell(-1);
                var tempCell3 = tempRow.insertCell(-1);
                var tempCell4 = tempRow.insertCell(-1);

                tempCell1.innerHTML = assignment.name;
                tempCell2.innerHTML = assignment.date;
                tempCell3.innerHTML = assignment.course;
                tempCell4.innerHTML = "REMOVE";

                tempCell1.setAttribute('class', "AssignmentCell");
                tempCell2.setAttribute('class', "AssignmentCell");
                tempCell3.setAttribute('class', "AssignmentCell");
                tempCell4.setAttribute('class', "Remove");

                var tempRow2 = document.getElementById("assignmentCalendar").rows[i+1];
                var Cell1=tempRow2.cells[0],Cell2=tempRow2.cells[1],Cell3=tempRow2.cells[2],Cell4=tempRow2.cells[3];
                Cell1.setAttribute("class", "AssignmentCell");
                Cell2.setAttribute("class", "AssignmentCell");
                Cell3.setAttribute("class", "AssignmentCell");
                Cell4.setAttribute("class", "Remove");

            }
            for(var i = 1; i <= numAssignments; i++)
            {
                table.rows[i].cells[3].onclick = function()
                {
                    index = this.parentElement.rowIndex;
                    removeAssignment(index);
                    
                };
                
            }
        }
        else{
            tableErrorText.innerHTML = "You Don't Have Any Current Assignments!\nAdd Assignments to this Calendar by Using the Form below";
        }
    });
}

function removeAssignment(index){
    chrome.storage.sync.get(function(data){
        var numAssignments = data.numCurrentAssignments;
        var tempAssignmentList = data.assignmentList;
        var nextAssignmentList = [];
        var assignment = tempAssignmentList[index-1];
        for(i=0;i<numAssignments;i++){
            if(i!=index-1){
                nextAssignmentList.push(assignment);
            }
        }
        var currentSet = {
            numCurrentAssignments:numAssignments-1,
            numTotalAssignments: data.numTotalAssignments-1,
            assignmentList:nextAssignmentList
        }
        chrome.storage.sync.set(currentSet,function(){});
        var table = document.getElementById("assignmentCalendar");
        table.deleteRow(index);
        if(numAssignments==1){
        var tableErrorText = document.getElementById("tableErrorText");
        tableErrorText.innerHTML = "You Don't Have Any Current Assignments!\nAdd Assignments to this Calendar by Using the Form below";
        }
    });
}
function submitFunction(){
    var form = document.getElementById("form");
    var assignmentName = form[1].value;
    var dueDate = form[2].value;
    var assignmentClass = form[3].value;
    var errorText = document.getElementById("formErrorText");
    if(assignmentName!=""&&dueDate!=""&&assignmentClass!=""){//Validates that the form has been filled out
        document.getElementById("form").reset();
        chrome.storage.sync.get(function(data) {
            var currentAssignment =  {
                name: assignmentName,
                date: dueDate,
                course: assignmentClass,
            };
            var currentAssignmentList = data.assignmentList;
            currentAssignmentList.push(currentAssignment);
            var currentSet = {
                assignmentList: currentAssignmentList,
                numCurrentAssignments: data.numCurrentAssignments+1,
                numTotalAssignments: data.numTotalAssignments+1
            };
            chrome.storage.sync.set(currentSet, function(){});
            loadTable();
        });    
    }else{//Tells user that the form is not fully filled out
        errorText.innerHTML = "All Sections of the Form Need to be Filled out before Submitting";
    }
}

function resetForm(){
    document.getElementById("form").reset();
}

function resetAll(){
    chrome.storage.sync.clear();
    setInitialTable();
}