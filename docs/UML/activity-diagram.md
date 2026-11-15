# UML Activity Diagrams

## 1. Stock-In Receiving Activity Flow

```mermaid
flowchart TD
    Start([User Initiates Stock In]) --> SelectProd[Select Product from Catalog]
    SelectProd --> ShowStock[System Displays Current Stock & Standard Cost]
    ShowStock --> InputDetails[Input Quantity, Unit Cost, Supplier, Reference & Notes]
    InputDetails --> ValidateInput{Valid Input? Quantity >= 1}
    ValidateInput -- No --> ShowValErr[Display Validation Error] --> InputDetails
    ValidateInput -- Yes --> StartTxn[Start Atomic DB Session]
    StartTxn --> UpdateProd[Execute $inc: { quantity: +qty } on Product]
    UpdateProd --> WriteLog[Persist Immutable StockTransaction Record]
    WriteLog --> CommitTxn[Commit Transaction]
    CommitTxn --> AuditEntry[Record Entry in ActivityLog]
    AuditEntry --> ShowSuccess([Display Success Certificate & New Balance])
```

---

## 2. Stock-Out Fulfillment Activity Flow

```mermaid
flowchart TD
    Start([User Initiates Stock Out]) --> SelectProd[Select Product from Catalog]
    SelectProd --> CheckZero{Available Stock == 0?}
    CheckZero -- Yes --> BlockAction[Disable Issue & Warn Out-of-Stock] --> End([Process Terminated])
    CheckZero -- No --> InputQty[Enter Quantity to Issue, Reason, Reference & Notes]
    InputQty --> CheckAvail{Quantity <= Available Stock?}
    CheckAvail -- No --> ShowErr[Display Error: Insufficient Stock] --> InputQty
    CheckAvail -- Yes --> StartTxn[Initiate Atomic DB Session]
    StartTxn --> CondUpdate[Execute Atomic Decrement where quantity >= requestedQty]
    CondUpdate --> CondSuccess{Match Found?}
    CondSuccess -- No --> Rollback[Abort Transaction & Re-fetch Balance] --> ShowErr
    CondSuccess -- Yes --> WriteLog[Persist Immutable StockTransaction Record]
    WriteLog --> CommitTxn[Commit Transaction]
    CommitTxn --> AuditEntry[Record Entry in ActivityLog]
    AuditEntry --> Success([Display Dispatch Confirmation & Remaining Stock])
```

---

## 3. User Authentication Flow

```mermaid
flowchart TD
    Start([User Enters Portal]) --> InputCreds[Enter Email & Password]
    InputCreds --> RateCheck{Exceeded Rate Limit?}
    RateCheck -- Yes --> Throttle[Return 429 Too Many Requests] --> End([Access Denied])
    RateCheck -- No --> FindUser[Query User by Email with select: +password]
    FindUser --> UserExists{User Found?}
    UserExists -- No --> BadCreds[Return 401 Invalid Email or Password] --> End
    UserExists -- Yes --> CheckActive{Is Account Active?}
    CheckActive -- No --> AccountDisabled[Return 403 Account Deactivated] --> End
    CheckActive -- Yes --> VerifyPass{bcrypt.compare candidate with hash}
    VerifyPass -- No --> BadCreds
    VerifyPass -- Yes --> RegenSession[Regenerate Express Session ID]
    RegenSession --> SaveSession[Store Session in MongoDB sessions collection]
    SaveSession --> SetCookie[Set HTTP-only, SameSite Cookie]
    SetCookie --> LogLogin[Record LOGIN in ActivityLog]
    LogLogin --> ReturnUser([Return User Safe Object & Route to Dashboard])
```
