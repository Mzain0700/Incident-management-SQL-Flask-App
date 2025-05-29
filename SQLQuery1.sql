create database SafeSpotProject;

-- UserRoles
CREATE TABLE UserRoles (
    RoleId INT PRIMARY KEY Identity(1,1),
    RoleName VARCHAR(50) NOT NULL UNIQUE,
);

--  Users
CREATE TABLE Users (
    UserId INT PRIMARY KEY Identity(1,1),
    Name VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(255),
    Phone VARCHAR(15),
    RoleId INT,
	ResponseTeamId INT,
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0,
    FOREIGN KEY (RoleId) REFERENCES UserRoles(RoleId),
	FOREIGN KEY (ResponseTeamId) REFERENCES ResponseTeam(ResponseTeamId)
);

-- Location
CREATE TABLE Location (
    LocationId INT PRIMARY KEY Identity(1,1),
    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6),
    Address VARCHAR(255),
    City VARCHAR(100),
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0
);

--IncidentCategory
CREATE TABLE IncidentCategory (
    CategoryId INT PRIMARY KEY Identity(1,1),
    CategoryName VARCHAR(100),
    Icon VARCHAR(100),
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0
);

-- Incidents
CREATE TABLE Incidents (
    IncidentId INT PRIMARY KEY Identity(1,1),
    UserId INT,
    CategoryId INT,
    LocationId INT,
	ResponseTeamId INT,
    Description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    CHECK (status IN ('pending','verified','rejected')),
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CategoryId) REFERENCES IncidentCategory(CategoryId),
    FOREIGN KEY (LocationId) REFERENCES Location(LocationId),
	FOREIGN KEY (ResponseTeamId) REFERENCES ResponseTeam(ResponseTeamId)
);

--Verifications
CREATE TABLE Verifications (
    VerficationId INT PRIMARY KEY Identity(1,1),
    IncidentId INT,
    UserId INT,
	ResponseTeamId INT,
	Vote varchar(20),
    Check (Vote IN ('True', 'fake')),
    VerifiedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0,
    FOREIGN KEY (IncidentId) REFERENCES Incidents(IncidentId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
	FOREIGN KEY (ResponseTeamId) REFERENCES ResponseTeam(ResponseTeamId)
);

SELECT * FROM sys.triggers
-- HotspotPrediction
CREATE TABLE HotspotPrediction (
    HotspotId INT PRIMARY KEY Identity(1,1),
    LocationId INT,
    CategoryId INT,
    ReportCount INT,
    RadiusMeters INT,
    Predictedt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0,
    FOREIGN KEY (LocationId) REFERENCES Location(LocationId),
    FOREIGN KEY (CategoryId) REFERENCES IncidentCategory(CategoryId)
);

-- 1.10 Notifications
CREATE TABLE Notifications (
    NotificationId INT PRIMARY KEY Identity(1,1),
    UserId INT,
    Message TEXT,
    IncidentId INT,
    HotspotId INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserId INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserId INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (IncidentId) REFERENCES Incidents(IncidentId),
    FOREIGN KEY (HotspotId) REFERENCES HotspotPrediction(HotspotId)
);

CREATE TABLE ResponseTeam
  (
    ResponseTeamId INT PRIMARY KEY Identity(1,1),
    Name VARCHAR(100) NOT NULL,
    Type VARCHAR(50),
CHECK (Type IN ('Police', 'Fire', 'Medical', 'Admin Support')),
    ContactEmail VARCHAR(100),
    ContactPhone VARCHAR(20),
    City VARCHAR(50),
    CreatedOnDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserID INT,
    UpdatedOnDate DATETIME,
    UpdatedByUserID INT,
    Active BIT DEFAULT 1,
    Deleted BIT DEFAULT 0
);


--Stored Procedures

--  Insert into UserRoles
CREATE PROCEDURE sp_InsertUserRole
    @RoleName VARCHAR(50)
AS
BEGIN
    INSERT INTO UserRoles (RoleName) VALUES (@RoleName);
END;

EXEC sp_InsertUserRole 'User';
EXEC sp_InsertUserRole 'Admin';
EXEC sp_InsertUserRole 'Responder';
 select * from UserRoles;

-- Insert into ResponseTeam
CREATE PROCEDURE sp_InsertResponseTeam
    @Name VARCHAR(100),
    @Type VARCHAR(50),
    @ContactEmail VARCHAR(100),
    @ContactPhone VARCHAR(20),
    @City VARCHAR(50),
    @CreatedByUserID INT
AS
BEGIN
    INSERT INTO ResponseTeam (Name, Type, ContactEmail, ContactPhone, City, CreatedByUserID)
    VALUES (@Name, @Type, @ContactEmail, @ContactPhone, @City, @CreatedByUserID);
END;

EXEC sp_InsertResponseTeam 'Islamabad Police', 'Police', 'police@isb.gov.pk', '0511234567', 'Islamabad', 1;

-- Insert into Users
CREATE PROCEDURE sp_InsertUser
    @Name VARCHAR(100),
    @Email VARCHAR(100),
    @Password VARCHAR(255),
    @Phone VARCHAR(15),
    @RoleId INT,
    @ResponseTeamId INT,
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO Users (Name, Email, Password, Phone, RoleId, ResponseTeamId, CreatedByUserId)
    VALUES (@Name, @Email, @Password, @Phone, @RoleId, @ResponseTeamId, @CreatedByUserId);
END;

EXEC sp_InsertUser 'Afeera', 'afeera@gmail.com', 'afeera123', '03001234567', 1, NULL, 1;
EXEC sp_InsertUser 'ZAIN', 'zain@gmail.com', 'zain123', '03001235467', 2, NULL, 1;

Select * from Users;
-- Insert into Location
CREATE PROCEDURE sp_InsertLocation
    @Latitude DECIMAL(9,6),
    @Longitude DECIMAL(9,6),
    @Address VARCHAR(255),
    @City VARCHAR(100),
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO Location (Latitude, Longitude, Address, City, CreatedByUserId)
    VALUES (@Latitude, @Longitude, @Address, @City, @CreatedByUserId);
END;

EXEC sp_InsertLocation 33.6844, 73.0479, 'G-9 Markaz', 'Islamabad', 1;

-- SP: Insert into IncidentCategory
CREATE PROCEDURE sp_InsertIncidentCategory
    @CategoryName VARCHAR(100),
    @Icon VARCHAR(100),
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO IncidentCategory (CategoryName, Icon, CreatedByUserId)
    VALUES (@CategoryName, @Icon, @CreatedByUserId);
END;

EXEC sp_InsertIncidentCategory 'Theft', 'icon-theft', 1;
EXEC sp_InsertIncidentCategory 'Accident', 'icon-accident', 1;

-- Insert into Incidents
CREATE PROCEDURE sp_InsertIncident
    @UserId INT,
    @CategoryId INT,
    @LocationId INT,
    @ResponseTeamId INT,
    @Description TEXT,
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO Incidents (UserId, CategoryId, LocationId, ResponseTeamId, Description, CreatedByUserId)
    VALUES (@UserId, @CategoryId, @LocationId, @ResponseTeamId, @Description, @CreatedByUserId);
END;

EXEC sp_InsertIncident 1, 1, 1, 1, 'Mobile snatching reported near G-9 Markaz', 1;

-- Insert into Verifications
CREATE PROCEDURE sp_InsertVerification
    @IncidentId INT,
    @UserId INT,
    @ResponseTeamId INT,
    @Vote VARCHAR(20),
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO Verifications (IncidentId, UserId, ResponseTeamId, Vote, CreatedByUserId)
    VALUES (@IncidentId, @UserId, @ResponseTeamId, @Vote, @CreatedByUserId);
END;

EXEC sp_InsertVerification 1, 1, 1, 'True', 1;

-- Insert into HotspotPrediction
CREATE PROCEDURE sp_InsertHotspotPrediction
    @LocationId INT,
    @CategoryId INT,
    @ReportCount INT,
    @RadiusMeters INT,
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO HotspotPrediction (LocationId, CategoryId, ReportCount, RadiusMeters, CreatedByUserId)
    VALUES (@LocationId, @CategoryId, @ReportCount, @RadiusMeters, @CreatedByUserId);
END;

EXEC sp_InsertHotspotPrediction 1, 1, 5, 500, 1;

-- SP: Insert into Notifications
CREATE PROCEDURE sp_InsertNotification
    @UserId INT,
    @Message TEXT,
    @IncidentId INT,
    @HotspotId INT,
    @CreatedByUserId INT
AS
BEGIN
    INSERT INTO Notifications (UserId, Message, IncidentId, HotspotId, CreatedByUserId)
    VALUES (@UserId, @Message, @IncidentId, @HotspotId, @CreatedByUserId);
END;

EXEC sp_InsertNotification 1, 'Hotspot alert: Theft incidents increasing in your area.', 1, 1, 1;






CREATE TRIGGER trg_IncidentVerified
ON Incidents
AFTER UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        WHERE i.status = 'verified' AND EXISTS (SELECT 1 FROM deleted d WHERE d.status <> 'verified')
    )
    BEGIN
        INSERT INTO Notifications (UserId, Message, IncidentId, CreatedByUserId)
        SELECT i.UserId, CONCAT('Your incident #', i.IncidentId, ' has been verified.'), i.IncidentId, i.UpdatedByUserId
        FROM inserted i;
    END
END;
GO

--TRIGGER Auto-Notify on Incident Rejection
CREATE TRIGGER trg_IncidentRejected
ON Incidents
AFTER UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        WHERE i.status = 'rejected' AND EXISTS (SELECT 1 FROM deleted d WHERE d.status <> 'rejected')
    )
    BEGIN
        INSERT INTO Notifications (UserId, Message, IncidentId, CreatedByUserId)
        SELECT i.UserId, CONCAT('Your incident #', i.IncidentId, ' was rejected.'), i.IncidentId, i.UpdatedByUserId
        FROM inserted i;
    END
END;
GO

-- TRIGGER Log Notification When Hotspot Is Created
CREATE TRIGGER trg_HotspotCreated
ON HotspotPrediction
AFTER INSERT
AS
BEGIN
    INSERT INTO Notifications (UserId, Message, HotspotId, CreatedByUserId)
    SELECT u.UserId, CONCAT('⚠️ Hotspot Alert: ', ic.CategoryName, ' reported in your area!'), h.HotspotId, h.CreatedByUserId
    FROM inserted h
    JOIN Users u ON u.Active = 1 AND u.Deleted = 0
    JOIN IncidentCategory ic ON h.CategoryId = ic.CategoryId;
END;
GO
------
-- TRIGGER Notify Admin and User Immediately After New Incident Report
CREATE TRIGGER trg_NotifyOnIncidentInsert
ON Incidents
AFTER INSERT
AS
BEGIN

    INSERT INTO Notifications (UserId, Message, IncidentId, CreatedByUserId)
    SELECT i.UserId, '✅ Your incident has been reported successfully.', i.IncidentId, i.CreatedByUserId
    FROM inserted i;


    INSERT INTO Notifications (UserId, Message, IncidentId, CreatedByUserId)
    SELECT u.UserId, CONCAT('🚨 New incident submitted by user ID ', i.UserId), i.IncidentId, i.CreatedByUserId
    FROM inserted i
    JOIN Users u ON u.RoleId = 2 AND u.Active = 1 AND u.Deleted = 0;
END;
GO


CREATE TRIGGER trg_NotifyAllOnVerification
ON Incidents
AFTER UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 FROM inserted i
        WHERE i.status = 'verified' AND EXISTS (SELECT 1 FROM deleted d WHERE d.status <> 'verified')
    )
    BEGIN
        INSERT INTO Notifications (UserId, Message, IncidentId, CreatedByUserId)
        SELECT u.UserId, '📢 A nearby incident has been verified. Stay alert!', i.IncidentId, i.UpdatedByUserId
        FROM inserted i
        CROSS JOIN Users u
        WHERE u.Active = 1 AND u.Deleted = 0;
    END
END;
GO
-----
CREATE TRIGGER trg_UpdateHotspotReportCount
ON Incidents
AFTER UPDATE
AS
BEGIN
    UPDATE hp
    SET hp.ReportCount = hp.ReportCount + 1
    FROM HotspotPrediction hp
    JOIN inserted i ON i.LocationId = hp.LocationId
    WHERE i.status = 'verified';
END;
GO
----------------Qurries------------------
SELECT 
    i.IncidentId,
    u.Name AS ReportedBy,
    ic.CategoryName,
    l.City,
    i.Description,
    i.status,
    i.CreatedOnDate
FROM Incidents i
JOIN Users u ON i.UserId = u.UserId
JOIN IncidentCategory ic ON i.CategoryId = ic.CategoryId
JOIN Location l ON i.LocationId = l.LocationId
WHERE i.Deleted = 0;

SELECT 
    v.VerficationId,
    i.IncidentId,
    u.Name AS VerifiedBy,
    r.Name AS Team,
    v.Vote,
    v.VerifiedAt
FROM Verifications v
JOIN Users u ON v.UserId = u.UserId
JOIN Incidents i ON v.IncidentId = i.IncidentId
JOIN ResponseTeam r ON v.ResponseTeamId = r.ResponseTeamId;

EXEC sp_InsertIncident 
    @UserId = 1, 
    @CategoryId = 1, 
    @LocationId = 1, 
    @ResponseTeamId = 1,
    @Description = 'Fire reported near G-10 Sector',
    @CreatedByUserId = 1;

SELECT 
    n.NotificationId,
    u.Name AS Recipient,
    n.Message,
    i.Description AS RelatedIncident,
    n.CreatedOnDate
FROM Notifications n
JOIN Users u ON n.UserId = u.UserId
LEFT JOIN Incidents i ON n.IncidentId = i.IncidentId
ORDER BY n.CreatedOnDate DESC;
------________________________________________________________________--------------




INSERT INTO Location (Latitude, Longitude, Address, City, CreatedByUserId) VALUES 
(33.6844, 73.0479, 'G-9 Markaz', 'Islamabad', 1),
(33.7105, 73.0551, 'F-10 Markaz', 'Islamabad', 1),
(33.7074, 73.0556, 'Blue Area', 'Islamabad', 1),
(33.6987, 73.0651, 'D-Chowk', 'Islamabad', 1),
(33.6844, 73.0564, 'Jinnah Avenue', 'Islamabad', 1),
(33.6653, 73.0751, 'PIMS Hospital', 'Islamabad', 1),
(33.7215, 73.0433, 'E-11', 'Islamabad', 1),
(33.7294, 73.0933, 'H-8', 'Islamabad', 1),
(33.7361, 73.0844, 'I-8', 'Islamabad', 1),
(33.6938, 73.0651, 'F-7', 'Islamabad', 1);

INSERT INTO IncidentCategory (CategoryName, Icon, CreatedByUserId) VALUES 
('Theft', 'icon-theft', 1),
('Accident', 'icon-accident', 1),
('Fire', 'icon-fire', 1),
('Medical Emergency', 'icon-medical', 1),
('Assault', 'icon-assault', 1),
('Vandalism', 'icon-vandalism', 1),
('Lost Item', 'icon-lost', 1),
('Suspicious Activity', 'icon-suspicious', 1),
('Public Disturbance', 'icon-disturbance', 1),
('Other', 'icon-other', 1);


INSERT INTO Users (Name, Email, Password, Phone, RoleId, ResponseTeamId, CreatedByUserId) VALUES 
('Ali Khan', 'ali.khan@gmail.com', 'password123', '03001234567', 1, NULL, 1),
('Ayesha Riaz', 'ayesha.riaz@gmail.com', 'ayesha456', '03002345678', 1, NULL, 1),
('Bilal Ahmed', 'bilal.ahmed@gmail.com', 'bilal789', '03003456789', 1, 1, 2),
('Zara Javed', 'zara.javed@gmail.com', 'zara321', '03004567890', 1,NULL, 1),
('Usman Tariq', 'usman.tariq@gmail.com', 'usman123', '03005678901', 1, NULL, 2),
('Nida Khalid', 'nida.khalid@gmail.com', 'nida654', '03006789012', 1, NULL, 1),
('Fahad Malik', 'fahad.malik@gmail.com', 'fahad321', '03007890123', 1, NULL, 2),
('Sana Iqbal', 'sana.iqbal@gmail.com', 'sana098', '03008901234', 1, NULL, 1),
('Hamza Ali', 'hamza.ali@gmail.com', 'hamza555', '03009012345', 1, NULL, 2),
('Tania Qureshi', 'tania.q@gmail.com', 'tania111', '03010123456', 1, NULL, 1);


INSERT INTO ResponseTeam (Name, Type, ContactEmail, ContactPhone, City, CreatedByUserID) VALUES 
('Islamabad Police', 'Police', 'police@isb.gov.pk', '0511234567', 'Islamabad', 1),
('Rescue 1122', 'Medical', 'rescue@isb.pk', '0512345678', 'Islamabad', 1),
('Capital Fire Brigade', 'Fire', 'fire@isb.pk', '0513456789', 'Islamabad', 1),
('Emergency Support Unit', 'Admin Support', 'support@isb.pk', '0514567890', 'Islamabad', 1),
('Traffic Police Islamabad', 'Police', 'traffic@isb.pk', '0515678901', 'Islamabad', 1),
('Islamabad Police Emergency', 'Police', 'emergency@isb.pk', '0516789012', 'Islamabad', 1),
('Health Department Islamabad', 'Medical', 'health@isb.pk', '0517890123', 'Islamabad', 1),
('Municipal Corporation', 'Admin Support', 'mci@isb.pk', '0518901234', 'Islamabad', 1),
('Disaster Response Team', 'Admin Support', 'disaster@isb.pk', '0519012345', 'Islamabad', 1),
('Fire and Rescue Unit', 'Fire', 'fireunit@isb.pk', '0510123456', 'Islamabad', 1);

SELECT * FROM ResponseTeam;
INSERT INTO Incidents (UserId, CategoryId, LocationId, ResponseTeamId, Description, CreatedByUserId) VALUES 
(1, 1, 1, 1, 'Mobile snatching reported near G-9 Markaz', 1),
(1, 2, 2, 9, 'Car accident at F-10 Markaz', 2),
(1, 3, 3, 10, 'Fire breakout in Blue Area', 1),
(1, 2, 4, 8, 'Heart attack at D-Chowk', 3),
(1, 3, 5, 11, 'Physical assault at Jinnah Avenue', 1),
(1, 4, 6, 12, 'Vandalism at PIMS Hospital', 1),
(1, 3, 7, 11, 'Lost wallet in E-11', 2),
(1, 2, 8, 10, 'Suspicious package in H-8', 1),
(1, 4, 9, 14, 'Public disturbance in I-8', 1),
(1, 1, 10, 16, 'Unidentified issue in F-7', 1);
