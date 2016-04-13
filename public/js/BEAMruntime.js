var BEAMRequest = [];
BEAMRequest[0] = new Array(18); 
var Message = [];
Message[0] = new Array(4);
var BEAMResponse = [];
BEAMResponse[0] = new Array(4);
var Process = [];
Process[0] = new Array(4);
var NewTime = 0;


function ProcessEvent(EventType, RecordID, Value) {
    try {
        var ProcessCode = 60000;
        Framework = Process[0][1];
            if (EventType == 3) {//Message
                Message = Process[0][0];
                MessageCode = Message[0][0];
                Description = Message[0][2];
                SourceCode = Message[0][3];
                alert(SourceCode + "-" + MessageCode + ": " + Description);
                return;
            }
        Methods = Process[0][1][0][0];
        for (RI = 0; RI < Methods.length; RI++) {
            if (Methods[RI][2] == EventType) {
                MethodID = Methods[RI][0];
                CallMethod(MethodID, RecordID, Value);
                break;
            }
        }
        if (EventType == 3) {//Message
            Message = Process[0][0];
            Message[0][0] = 0;
            Message[0][1] = 0;
            Message[0][2] = "";
            Message[0][3] = 0;
            Process[0][0] = Message;
        }
    }
    catch (err) {
        alert(1 + "-" + ProcessCode + ": " + err);
    }
}


function CallMethod(MethodID, RecordID, Value) {
    try {
        var ProcessCode = 10000;
        var ConditionMet = 0;
        if (MethodID == 0) { 
            return;
        }
        if (RecordID != undefined) {
            BEAMRequest[0][10] = RecordID;
        }
        if (Value != undefined) {
            BEAMRequest[0][12] = Value;
        }
        MethodSteps = Process[0][1][0][1];
        var StartIndex =  MethodSteps.binaryIndexOf(MethodID,0);       
        for (var StepRI = StartIndex; StepRI < MethodSteps.length  && MethodSteps[StepRI][0] == MethodID; StepRI++) {
            if (MethodSteps[StepRI][0] == MethodID) {
                SkipCommand = 0;
                ConditionOperator = MethodSteps[StepRI][7];
                ElseCondition = MethodSteps[StepRI][3];
                if (ElseCondition == 0) {
                    ConditionMet = 0;
                }
                else if (ConditionMet == 1) {
                    SkipCommand = 1;
                }
                if (ConditionOperator != 0) {
                    ConditionDSI = MethodSteps[StepRI][4];
                    ConditionNDSI = MethodSteps[StepRI][5];
                    ConditionCI = MethodSteps[StepRI][6];
                    ConditionValue = MethodSteps[StepRI][8];
                    if (ConditionDSI >= 0) {
                        SourceValue = Process[0][ConditionDSI][0][ConditionNDSI][0][ConditionCI];
                    }
                    else {
                        SourceValue = BEAMRequest[0][ConditionCI];
                    }
                    switch (ConditionOperator) {
                        case 1: //=
                            if (SourceValue != ConditionValue) {
                                SkipCommand = 1;
                            }
                            break;

                        case 2: //<>
                            if (SourceValue == ConditionValue) {
                                SkipCommand = 1;
                            }
                            break;
                        case 3: //contains 
                            if (ConditionValue.indexOf("'" + SourceValue + "'") < 0) {
                                SkipCommand = 1;
                            }
                            break;
                        case 4: //not in 
                            if (ConditionValue.indexOf("'" + SourceValue + "'") >= 0) {
                                SkipCommand = 1;
                            }
                            break;
                        case 5: //< 
                            if (Number(SourceValue) >= Number(ConditionValue)) {
                                SkipCommand = 1;
                            }
                            break;
                        case 6: //> 
                            if (Number(SourceValue) <= Number(ConditionValue)) {
                                SkipCommand = 1;
                            }
                            break;
                    }
                }
                if (SkipCommand == 1) {
                    continue;
                }
                ConditionMet = 1;
                CommandCode = MethodSteps[StepRI][1];
                ObjectID = MethodSteps[StepRI][2];
                if (ObjectID == 0) {
                    ObjectID = BEAMRequest[0][9];
                }
                switch (CommandCode) {
                    case 1:
                        CallMethod(ObjectID);
                        break;
                    case 2:
                    	TransferData(ObjectID, -1, -1, -1, -1, -1, -1);
                        break;
                    case 3:
                        ClearData(ObjectID);
                        break;
                    case 4:
                        SendReceive();
                        break;
                }
            }
        }
    }
    catch (err) {
        alert(1 + "-" + ProcessCode + ": (" + MethodID + "," + RecordID + ") " + err);
    }
}



function TransferData(TransferID, ParentFromDSI, ParentFromNDSI, ParentFromRI, ParentToDSI, ParentToNDSI, ParentToRI) {
    try {
        var ProcessCode = 20000;
        var i = 0;
        Transfers = Process[0][1][0][2];
        TransferColumns = Process[0][1][0][3];
        TransferConditions = Process[0][1][0][4];
        TransferFormulas = Process[0][1][0][5];
        DSColumns = Process[0][1][0][6];

        for (var RI = 0; RI < Transfers.length; RI++) {
            if (Transfers[RI][0] == TransferID) {
                var TransferType = Transfers[RI][1];
                var FromDSI = Transfers[RI][2];
                var FromNDSI = Transfers[RI][3];
                var FromCI;
                var ToDSI = Transfers[RI][4];
                var ToNDSI = Transfers[RI][5];
                var ToCI = Transfers[RI][6];
                var FromDataset;
                var ToDataset;
                if (FromDSI >= 0) {
                    FromDataset = Process[0][FromDSI][0][FromNDSI];
                }
                else if (FromNDSI >= 0) {
                    FromDataset = Process[0][FromNDSI];
                }
                else {
                    FromDataset = BEAMRequest;
                }
                if (ToDSI >= 0) {
                    ToDataset = Process[0][ToDSI][0][ToNDSI];
                }
                else if (ToNDSI >= 0) {
                    ToDataset = Process[0][ToNDSI];
                }
                else {
                    ToDataset = BEAMRequest;
                }
                if (FromDataset == undefined) {
                    FromDataset = [];
                }
                else {
                    FromDataset = FromDataset.slice();
                }
                if (ToDataset == undefined) {
                    ToDataset = [];
                }
                var StartToRI = 0;
                var StartFromRI = 0;
                var FromRows = FromDataset.length;
                var ToRows = 1;
                if (TransferType == 2 || TransferType == 5 || TransferType == 8) {//update or nest or nest recordcount 		    
                    ToRows = ToDataset.length;
                }

                switch (TransferType) {
                    case 4: //copy
                        Process[0][ToDSI][0][ToNDSI] = FromDataset.slice();
                        return;
                }
                if (TransferType == 2 && ParentFromRI >= 0 && ToDSI == ParentToDSI && ToNDSI == ParentToNDSI) {
                    StartToRI = ParentToRI;
                    ToRows = StartToRI + 1;
                    if (FromDSI == ToDSI && FromNDSI == ToNDSI) { 
                        StartFromRI = StartToRI;
                        FromRows = ToRows;
                    }
                }

                if (TransferType == 2 || TransferType == 7 || TransferType == 1) { 
                    if (ParentFromRI >= 0 && FromDSI == ParentFromDSI && FromNDSI == ParentFromNDSI) {
                        StartFromRI = ParentFromRI;
                        FromRows = StartFromRI + 1;
                    }
                }
                for (var ToRI = StartToRI; ToRI < ToRows; ToRI++) {
                    if (ParentToRI < 0 || (TransferType != 2 && TransferType != 5) || ToRI == ParentToRI) {
                        for (var FromRI = StartFromRI; FromRI < FromRows; FromRI++) {
                            //*******if TransferType is Update and the From and ToDatasets are the same:
                            if (TransferType == 2 && FromDSI == ToDSI && FromNDSI == ToNDSI && (ParentToRI < 0 || ParentToDSI != ToDSI || ParentToNDSI != ToNDSI)) { 
                                ToRI = FromRI; //suppprts transfer id 150 and 40
                            }
                            CriteriaMet = true;
                            var StartIndex =  TransferConditions.binaryIndexOf(TransferID,0);
                            for (ConditionsRI = StartIndex; ConditionsRI < TransferConditions.length && TransferConditions[ConditionsRI][0] == TransferID; ConditionsRI++) {
                                    FromCI = TransferConditions[ConditionsRI][1];
                                    FromValue = FromDataset[FromRI][FromCI];
                                    OperatorCode = TransferConditions[ConditionsRI][2];
                                    SourceCode = TransferConditions[ConditionsRI][3];
                                    switch (SourceCode) {
                                        case 1: //Column
                                            ConditionDSI = TransferConditions[ConditionsRI][5];
                                            ConditionNDSI = TransferConditions[ConditionsRI][6];
                                            ConditionCI = TransferConditions[ConditionsRI][7];
                                            if (ConditionDSI >= 0) {
                                            	if (FromDSI == ConditionDSI && FromNDSI == ConditionNDSI ){ 
                                                    SourceValue = Process[0][ConditionDSI][0][ConditionNDSI][FromRI][ConditionCI];
                                            	}
                                            	else {
                                                    SourceValue = Process[0][ConditionDSI][0][ConditionNDSI][0][ConditionCI];
                                            	}
                                            }
                                            else {
                                                SourceValue = BEAMRequest[0][ConditionCI];
                                            }
                                            break;
                                        case 2: //constant
                                            SourceValue = TransferConditions[ConditionsRI][4];
                                            break;
                                        case 3: //to row index
                                            SourceValue = ToRI;
                                            break;
                                        case 4: //parent from row index
                                            FromValue = FromRI;
                                            SourceValue = ParentFromRI;
                                            break;
                                        case 5: //parent from row Column 
                                            ConditionDSI = TransferConditions[ConditionsRI][5];
                                            ConditionNDSI = TransferConditions[ConditionsRI][6];
                                            ConditionCI = TransferConditions[ConditionsRI][7];
                                            SourceValue = Process[0][ConditionDSI][0][ConditionNDSI][ParentFromRI][ConditionCI];
                                            break;
                                        case 6: //parent to row Column 
                                            ConditionDSI = TransferConditions[ConditionsRI][5];
                                            ConditionNDSI = TransferConditions[ConditionsRI][6];
                                            ConditionCI = TransferConditions[ConditionsRI][7];
                                            SourceValue = Process[0][ConditionDSI][0][ConditionNDSI][ParentToRI][ConditionCI];
                                            break;
                                        case 7: //current milliseconds 
                                            SourceValue = new Date();
                                            SourceValue = SourceValue.getTime();
                                            break;
                                    }
                                    switch (OperatorCode) {
                                        case 1: //=
                                            if (FromValue != SourceValue) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 2: //<>
                                            if (FromValue == SourceValue) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 3: //in 
                                            if (SourceValue.indexOf("'" + FromValue + "'") < 0) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 4: //< 
                                            if (FromValue >= SourceValue) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 5: //> 
                                            if (FromValue <= SourceValue) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 6: //not in 
                                            if (SourceValue.indexOf("'" + FromValue + "'") >= 0) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 7: //<= 
                                            if (FromValue > SourceValue) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                        case 8: //>= 
                                            if (FromValue < SourceValue) {
                                                CriteriaMet = false;
                                            }
                                            break;
                                    }
                            }
                            if (CriteriaMet == true) {
                                switch (TransferType) {
                                    case 1: //append
                                        ToRI = ToDataset.length;
                                        var ToDSColumns = [];
                                        for (i = 0; i < DSColumns.length; i++) {
                                            if (DSColumns[i][0] == ToDSI && DSColumns[i][1] == ToNDSI) {
                                                ToDSColumns.push(DSColumns[i]);
                                            }
                                        }
                                        ToDataset[ToRI] = new Array(ToDSColumns.length - 1);
                                        for (var ColumnRI = 0; ColumnRI < ToDSColumns.length; ColumnRI++) {
                                            ToCI = ToDSColumns[ColumnRI][2];
                                            Value = ToDSColumns[ColumnRI][3];
                                            ToDataset[ToRI][ToCI] = Value;
                                        }
                                        break;


                                    case 3: //delete
                                        Process[0][FromDSI][0][FromNDSI].splice([FromRI], 1);
                                        return; 

                                    case 5: //nest
                                        var NestDataset = [];
                                        for (i = 0; i < FromDataset.length; i++) {
                                            NestDataset.push(FromDataset[i].slice());
                                        }
                                        ToDataset[ToRI][ToCI] = NestDataset;
                                        return;

                                    case 6: //cross update from columns
                                        for (FromCI = 0; FromCI < FromDataset[0].length; FromCI++) {
                                            ToDataset[FromCI][ToCI] = FromDataset[FromRI][FromCI];
                                        }
                                        ToDataset = ToDataset.slice();
                                        return;


                                    case 7: //restore
                                        var RestoreDataset = [];
                                        for (i = 0; i < FromDataset[FromRI][ToCI].length; i++) {
                                            RestoreDataset.push(FromDataset[FromRI][ToCI][i].slice());
                                        }
                                        Process[0][ToDSI][0][ToNDSI] = RestoreDataset;
                                        return;

                                    case 8: //nest recordcount 
                                        ToDataset[ToRI][ToCI] = FromDataset.length;
                                        return;

                                    case 9: //cross update from rows  
                                        for (FromRI = 0; FromRI < FromDataset.length; FromRI++) {
                                            ToDataset[0][FromRI] = FromDataset[FromRI][ToCI];
                                        }
                                        ToDataset = ToDataset.slice();
                                        return;

                                }
                                var StartIndex = TransferColumns.binaryIndexOf(TransferID,0);
                                for (ColumnRI = StartIndex; ColumnRI < TransferColumns.length && TransferColumns[ColumnRI][0] == TransferID; ColumnRI++) {
                                        SourceCode = TransferColumns[ColumnRI][1];
                                        ToCI = TransferColumns[ColumnRI][3];
                                        switch (SourceCode) {
                                            case 1: //column
                                                FromCI = TransferColumns[ColumnRI][2];
                                                FromValue = FromDataset[FromRI][FromCI];
                                                break;

                                            case 2: //constant
                                                FromValue = TransferColumns[ColumnRI][2];
                                                break;

                                            case 3: //formula
                                                ColumnID = TransferColumns[ColumnRI][2];
                                                FromValue = "";
                                                if (TransferType == 2) {  
                                                    FromValue = ToDataset[ToRI][ToCI];
                                                }
                                                var StartIndex = TransferFormulas.binaryIndexOf(ColumnID,0);
                                                for (var formulaRI = StartIndex; formulaRI < TransferFormulas.length && TransferFormulas[formulaRI][0] == ColumnID; formulaRI++) {
                                                        SourceCode = TransferFormulas[formulaRI][2];
                                                        OperatorCode = TransferFormulas[formulaRI][1];
                                                        switch (SourceCode) {
                                                            case 1: //Column
                                                                FromCI = TransferFormulas[formulaRI][3];
                                                                SourceValue = FromDataset[FromRI][FromCI];
                                                                break;
                                                            case 2: //constant
                                                                SourceValue = TransferFormulas[formulaRI][3];
                                                                break;
                                                            case 3: //row index
                                                                SourceValue = FromRI;
                                                                break;
                                                            case 4: //current milliseconds 
                                                                SourceValue = new Date();
                                                                SourceValue = SourceValue.getTime();
                                                                break;
                                                            case 5: //current ISO date/time
                                                                SourceValue = new Date().toISOString(); 
                                                                break;
                                                            case 6: //screen width
                                                                SourceValue = ScreenWidth;
                                                                break;
                                                            case 7: //screen height
                                                                SourceValue = ScreenHeight;
                                                                break;
                                                            case 8: //GUID  (A4ACC4F5-BEA2-4F4E-BC63-5DA0AD38112B)
                                                            	var d = new Date().getTime();
                                                            	SourceValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                                                            		var r = (d + Math.random()*16)%16 | 0;
                                                            		d = Math.floor(d/16);
                                                            		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
                                                            		});
                                                            		break;
                                                        }
                                                        switch (OperatorCode) {
                                                        	case 0: //set
                                                        		FromValue = SourceValue;
                                                        		break;
                                                            case 1: //append
                                                                FromValue = FromValue + SourceValue;
                                                                break;
                                                            case 2: //trim
                                                                FromValue = FromValue.substr(0, FromValue.length - parseInt(SourceValue));
                                                                break;
                                                            case 3: //+
                                                                FromValue = Number(FromValue) + Number(SourceValue);
                                                                break;
                                                            case 4: //Parse 
                                                                var StartPosition = 0;
                                                                var EndPosition = -2;
                                                                for (var Occurence = 1; Occurence <= parseInt(SourceValue); Occurence++) {
                                                                    StartPosition = EndPosition + 2;
                                                                    EndPosition = FromValue.indexOf("||", StartPosition);
                                                                }
                                                                if (EndPosition < 0) {
                                                                    EndPosition = FromValue.length;
                                                                }
                                                                FromValue = FromValue.substr(StartPosition, EndPosition - StartPosition);
                                                                break;
                                                            case 5: //insert prefix
                                                                FromValue = SourceValue + FromValue;
                                                                break;
                                                            case 6: //Multipled by
                                                                FromValue = Number(FromValue) * Number(SourceValue);
                                                                break;
                                                            case 7: //Divided by
                                                                FromValue = Number(FromValue) / Number(SourceValue);
                                                                break;
                                                            case 8: //Minus
                                                                FromValue = Number(FromValue) - Number(SourceValue);
                                                                break;
                                                            case 9: //Toggle
                                                                if (Number(FromValue) == 0) { FromValue = 1 }
                                                                else { FromValue = 0 }
                                                                break;
                                                            case 10: //Convert to UpperCase  
                                                                FromValue = SourceValue.toUpperCase();
                                                                break;
                                                            case 11: //Convert to LowerCase  
                                                                FromValue = SourceValue.toLowerCase();
                                                                break;
                                                            case 12: //Choose  
                                                                var SourceArray = SourceValue.split(",");
                                                                FromValue = SourceArray[FromValue];
                                                                break;
                                                            case 13: //Parse Integer  
                                                                FromValue = parseInt(SourceValue);
                                                                break;
                                                            case 14: //Modulus  
                                                                if (Number(SourceValue) > 0) { FromValue = Number(FromValue) % Number(SourceValue) }
                                                                else { FromValue = 0 }
                                                                break;
                                                            case 15: //Format Date  
                                                                FromValue = FromValue.replace("AM"," AM"); //temp fix to resolve google/firefox error
                                                                FromValue = FromValue.replace("PM"," PM"); //temp fix to resolve google/firefox error
                                                                FromValue = new Date(FromValue); //Date object 
                                                                FromValue = FromValue.format(SourceValue);
                                                                break;
                                                            case 16: //Round  
                                                                FromValue = Math.round(Number(SourceValue));
                                                                break;
                                                        }
                                                }
                                                break;

                                            case 4: //parent index
                                                FromValue = ParentToRI;
                                                break;

                                            case 5: //row index
                                                FromValue = ToRI;
                                                break;
                                        }

                                        ToDataset[ToRI][ToCI] = FromValue;
                                }
                                if (ToDSI >= 0) {
                                    Process[0][ToDSI][0][ToNDSI] = ToDataset.slice();
                                }
                                else if (ToNDSI >= 0) {
                                    Process[0][ToNDSI] = ToDataset.slice();
                                }
                                else {
                                    BEAMRequest = ToDataset.slice();
                                }
                                var StartIndex = Transfers.binaryIndexOf(TransferID,7);
                                for (var TransferRI = StartIndex; TransferRI < Transfers.length && Transfers[TransferRI][7] == TransferID; TransferRI++) {
                                        TransferData(Transfers[TransferRI][0], FromDSI, FromNDSI, FromRI, ToDSI, ToNDSI, ToRI);
                                }
                            }
                        }
                    }
                }
                break;
            }
        }
        if (ToDSI >= 0) {
            Process[0][ToDSI][0][ToNDSI] = ToDataset.slice();
        }
        else if (ToNDSI >= 0) {
            Process[0][ToNDSI] = ToDataset.slice();
        }
        else {
            BEAMRequest = ToDataset.slice();
        }

    }
    catch (err) {
        alert(1 + "-" + ProcessCode + ": (" + TransferID + "," + ParentToRI + ") " + err);
    }
}



function ClearData(NDSI) {
    try {
        var ProcessCode = 30000;
        App = Process[0][2];
        if (App[0][NDSI] == undefined) {
            return;
        }
        App[0][NDSI].length = 0;
        Process[0][2] = App.slice();
    }
    catch (err) {
        alert(1 + "-" + ProcessCode + ": " + err);
    }
}



function SendReceive() {
    try {
        var ProcessCode = 40000;
        RequestType = parseInt(BEAMRequest[0][0]);
        RemoteConnectType = parseInt(BEAMRequest[0][1]);
        RemoteConnection = BEAMRequest[0][2];
        ResourceConnectType = parseInt(BEAMRequest[0][3]);
        ResourceConnection = BEAMRequest[0][4];
        StatementType = BEAMRequest[0][5];
        Statement = BEAMRequest[0][6];
        if (RemoteConnectType == 0) { //Execute via Resource
            ConnectType = ResourceConnectType;
            ConnectString = ResourceConnection;
            SendString = Statement;
        }
        if (RemoteConnectType == 1) { //Send BEAMRequest to Remote Agent
            ConnectType = RemoteConnectType;
            ConnectString = RemoteConnection;
            //temp fix next line
            if (ResourceConnectType==4 && BEAMRequest[0][5]>0){
            	Statement = JSON.stringify(Statement);
            	BEAMRequest[0][6]=Statement.replace(/'/g, "''");
            }
            SendString = JSON.stringify(BEAMRequest);
        }
        if (RemoteConnectType > 1) { //Execute via Remote Resource
            ConnectType = RemoteConnectType;
            ConnectString = RemoteConnection;
            SendString = Statement;
        }
        ResourceHandler(ConnectType, ConnectString, StatementType, SendString);
        winPop = [];
        if (BEAMResponse == null) {return;}
        for (var RI = 0; RI < BEAMResponse.length; RI++) {
        	ResponseType = JSON.parse(BEAMResponse[RI][0]);
        	Response = JSON.parse(BEAMResponse[RI][1]);
        	switch (ResponseType) {
        		case 0: //message
        			Process[0][0] = Response;
        	        MessageType = Response[0][1];
        	        if (MessageType == 1) {//error
        	            ProcessEvent(3, 0, ""); //message
        	        }
        			break;
        		case 1: //framework
        			if (Response[0].length > 1 ){//temp fix
        				Process[0][1] = Response;
        			}
        			break;
        		case 2: //state
        			Process = Response;
        			break;
        		case 3: //data
        			Process[0][3] = Response;
        			break;
        		case 4: //request
        	        ResourceConnectType = parseInt(Response[3]);
        	        ResourceConnection = Response[4];
        	        StatementType = Response[5];
        	        Statement = Response[6];
        	        ResourceHandler(ResourceConnectType, ResourceConnection, StatementType, Statement);
        			break;
        		case 6: //app
        			Process[0][2] = Response;
        			break;
        		}
        }
        BEAMResponse = null;
    }
    catch (err) {
        alert(1 + "-" + ProcessCode + ": " + err);
    }
}

function ConsoleLog(Statement) {
    LastTime = NewTime;
    NewTime = new Date();
    LapsedTime = NewTime-LastTime;
   console.log(Statement + ' (' + LapsedTime.toString() + ')');
}

Array.prototype.binaryIndexOf = function(searchElement, CI) {
    try {
        var ProcessCode = 90000;

    'use strict';
 
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;
    var firstIndex;
 
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex][CI];
        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
        	firstIndex = currentIndex;
        	while (currentElement == searchElement && currentIndex > 0) {
        		currentIndex = firstIndex;
        		firstIndex = currentIndex - 1; 
        		if (firstIndex >= 0) { 
        			currentElement = this[firstIndex][CI]; 
        		}
        	}
            return currentIndex;
        }
    }
    return this.length + 1;
    }
    catch (err) {
        alert(1 + "-" + ProcessCode + ": (" + currentIndex + "," + currentElement + ") " + err);
    }
}

