from flask import Flask, request, jsonify, send_from_directory
import pyodbc
from flask_cors import CORS
import json
from datetime import datetime
import os
import graph

app = Flask(__name__, static_folder='.')
CORS(app)  

# Database connection string - update with your SQL Server details
# conn_str = (
#     "DRIVER={SQL Server};"
#     "SERVER=your_server_name;"
#     "DATABASE=SafeSpotProject;"
#     "UID=your_username;"
#     "PWD=your_password;"
# )
conn_str = (
    "DRIVER={SQL Server};"
    "SERVER=DESKTOP-E6QS9C9\\SQLEXPRESS;"  
    "DATABASE=SafeSpotProject;"
    "Trusted_Connection=yes;"
)


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

def row_to_dict(row, cursor):
    return {cursor.description[i][0]: value for i, value in enumerate(row)}


def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def format_status(status):
    if status == "pending" or status == 0:
        return "Reported"
    elif status == "in_progress" or status == 1:
        return "In Progress"
    elif status == "verified" or status == "resolved" or status == 2:
        return "Resolved"
    elif status == "rejected" or status == "closed" or status == 3:
        return "Closed"
    else:
        return "Unknown"


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
      
        cursor.execute("""
            SELECT u.*, r.RoleName 
            FROM Users u
            JOIN UserRoles r ON u.RoleId = r.RoleId
            WHERE u.Email = ? AND u.Password = ? AND u.Active = 1 AND u.Deleted = 0
        """, (email, password))
        
        user = cursor.fetchone()
        
        if user:
            user_dict = row_to_dict(user, cursor)
            return jsonify({"success": True, "user": user_dict})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/incidents', methods=['GET'])
def get_all_incidents():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT 
                i.IncidentId, i.UserId, i.CategoryId, i.LocationId, i.ResponseTeamId,
                u.Name AS ReportedBy, ic.CategoryName, l.City, i.Description, i.status,
                i.CreatedOnDate,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'True') AS trueCount,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'fake') AS fakeCount
            FROM Incidents i
            JOIN Users u ON i.UserId = u.UserId
            JOIN IncidentCategory ic ON i.CategoryId = ic.CategoryId
            JOIN Location l ON i.LocationId = l.LocationId
            WHERE i.Deleted = 0
            ORDER BY i.CreatedOnDate DESC
        """)
        
        incidents = []
        for row in cursor.fetchall():
            incident = row_to_dict(row, cursor)
            
            incident['formattedStatus'] = format_status(incident['status'])
            incidents.append(incident)
        
        return json.dumps(incidents, default=json_serial)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/incidents/user/<int:user_id>', methods=['GET'])
def get_user_incidents(user_id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT 
                i.IncidentId, i.CategoryId, ic.CategoryName, l.City, i.Description, i.status,
                i.CreatedOnDate,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'True') AS trueCount,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'fake') AS fakeCount
            FROM Incidents i
            JOIN IncidentCategory ic ON i.CategoryId = ic.CategoryId
            JOIN Location l ON i.LocationId = l.LocationId
            WHERE i.UserId = ? AND i.Deleted = 0
            ORDER BY i.CreatedOnDate DESC
        """, (user_id,))
        
        incidents = []
        for row in cursor.fetchall():
            incident = row_to_dict(row, cursor)
            # Format the status
            incident['formattedStatus'] = format_status(incident['status'])
            incidents.append(incident)
        
        return json.dumps(incidents, default=json_serial)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/incidents/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT 
                i.IncidentId, i.UserId, i.CategoryId, i.LocationId, i.ResponseTeamId,
                i.Description, i.status, i.CreatedOnDate,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'True') AS trueCount,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'fake') AS fakeCount
            FROM Incidents i
            WHERE i.IncidentId = ? AND i.Deleted = 0
        """, (incident_id,))
        
        incident = cursor.fetchone()
        
        if incident:
            incident_dict = row_to_dict(incident, cursor)
            # Format the status
            incident_dict['formattedStatus'] = format_status(incident_dict['status'])
            return json.dumps(incident_dict, default=json_serial)
        else:
            return jsonify({"success": False, "message": "Incident not found"}), 404
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/incidents', methods=['POST'])
def create_incident():
    data = request.json
    
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        # First create location
        cursor.execute("""
            EXEC sp_InsertLocation ?, ?, ?, ?, ?
        """, (
            0.0,  
            0.0, 
            data.get('address'),
            data.get('city'),
            data.get('userId')
        ))
        
        # Get the new location ID
        cursor.execute("SELECT @@IDENTITY")
        location_id = cursor.fetchone()[0]
        
          
        cursor.execute("""
            EXEC sp_InsertIncident ?, ?, ?, ?, ?, ?
        """, (
            data.get('userId'),
            data.get('categoryId'),
            location_id,
            None,  # ResponseTeamId (will be assigned by admin)
            data.get('description'),
            data.get('userId')
        ))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Incident created successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

# Update the update_incident function to handle string status values correctly
@app.route('/api/incidents/<int:incident_id>', methods=['PUT'])
def update_incident(incident_id):
    data = request.json
    
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        # Log the incoming data for debugging
        print(f"Updating incident {incident_id} with data: {data}")
        
        # Get the current incident data to ensure we have valid values
        cursor.execute("""
            SELECT CategoryId, ResponseTeamId, Description, status
            FROM Incidents
            WHERE IncidentId = ? AND Deleted = 0
        """, (incident_id,))
        
        current_incident = cursor.fetchone()
        if not current_incident:
            return jsonify({"success": False, "message": "Incident not found"}), 404
            
        # Use provided values or fall back to current values
        category_id = data.get('categoryId') or current_incident[0]
        response_team_id = data.get('responseTeamId')
        description = data.get('description') or current_incident[2]
        status = data.get('status')
        
        # If status is not provided, use current status
        if status is None:
            status = current_incident[3]
        
        # Update incident
        cursor.execute("""
            UPDATE Incidents
            SET CategoryId = ?,
                ResponseTeamId = ?,
                Description = ?,
                status = ?,
                UpdatedOnDate = GETDATE(),
                UpdatedByUserId = 1
            WHERE IncidentId = ?
        """, (
            category_id,
            response_team_id,
            description,
            status,
            incident_id
        ))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Incident updated successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        print(f"Error updating incident: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

@app.route('/api/incidents/<int:incident_id>', methods=['DELETE'])
def delete_incident(incident_id):
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        # Soft delete
        cursor.execute("""
            UPDATE Incidents
            SET Deleted = 1,
                UpdatedOnDate = GETDATE(),
                UpdatedByUserId = 1
            WHERE IncidentId = ?
        """, (incident_id,))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Incident deleted successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT CategoryId, CategoryName
            FROM IncidentCategory
            WHERE Active = 1 AND Deleted = 0
        """)
        
        categories = []
        for row in cursor.fetchall():
            categories.append(row_to_dict(row, cursor))
        
        return jsonify(categories)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/teams', methods=['GET'])
def get_teams():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT ResponseTeamId, Name, Type, ContactEmail, ContactPhone, City
            FROM ResponseTeam
            WHERE Active = 1 AND Deleted = 0
        """)
        
        teams = []
        for row in cursor.fetchall():
            teams.append(row_to_dict(row, cursor))
        
        return jsonify(teams)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT u.UserId, u.Name, u.Email, u.Phone, u.RoleId, r.RoleName
            FROM Users u
            JOIN UserRoles r ON u.RoleId = r.RoleId
            WHERE u.Active = 1 AND u.Deleted = 0
        """)
        
        users = []
        for row in cursor.fetchall():
            users.append(row_to_dict(row, cursor))
        
        return jsonify(users)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/incidents/all', methods=['GET'])
def get_all_incidents_for_users():
    user_id = request.args.get('userId')
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        # Get all incidents with verification status for the current user
        cursor.execute("""
            SELECT 
                i.IncidentId, i.UserId, i.CategoryId, i.LocationId, i.ResponseTeamId,
                u.Name AS ReportedBy, ic.CategoryName, l.City, i.Description, i.status,
                i.CreatedOnDate,
                CASE WHEN v.VerficationId IS NOT NULL THEN 1 ELSE 0 END AS userHasVerified,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'True') AS trueCount,
                (SELECT COUNT(*) FROM Verifications WHERE IncidentId = i.IncidentId AND Vote = 'fake') AS fakeCount
            FROM Incidents i
            JOIN Users u ON i.UserId = u.UserId
            JOIN IncidentCategory ic ON i.CategoryId = ic.CategoryId
            JOIN Location l ON i.LocationId = l.LocationId
            LEFT JOIN Verifications v ON i.IncidentId = v.IncidentId AND v.UserId = ?
            WHERE i.Deleted = 0
            ORDER BY i.CreatedOnDate DESC
        """, (user_id,))
        
        incidents = []
        for row in cursor.fetchall():
            incident = row_to_dict(row, cursor)
            # Format the status
            incident['formattedStatus'] = format_status(incident['status'])
            incidents.append(incident)
        
        return json.dumps(incidents, default=json_serial)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/verifications', methods=['POST'])
def create_verification():
    data = request.json
    
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
      
        cursor.execute("""
            SELECT ResponseTeamId FROM Users WHERE UserId = ?
        """, (data.get('userId'),))
        
        user = cursor.fetchone()
        response_team_id = user[0] if user and user[0] else None
        
        # Create verification
        cursor.execute("""
            EXEC sp_InsertVerification ?, ?, ?, ?, ?
        """, (
            data.get('incidentId'),
            data.get('userId'),
            response_team_id,
            data.get('vote'),
            data.get('userId')
        ))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Verification submitted successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

@app.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT LocationId, Address, City
            FROM Location
            WHERE Active = 1 AND Deleted = 0
        """)
        
        locations = []
        for row in cursor.fetchall():
            locations.append(row_to_dict(row, cursor))
        
        return jsonify(locations)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/hotspots', methods=['GET'])
def get_hotspots():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT 
                h.HotspotId, h.LocationId, h.CategoryId, h.ReportCount, h.RadiusMeters, h.Predictedt,
                l.Address, l.City, ic.CategoryName
            FROM HotspotPrediction h
            JOIN Location l ON h.LocationId = l.LocationId
            JOIN IncidentCategory ic ON h.CategoryId = ic.CategoryId
            WHERE h.Active = 1 AND h.Deleted = 0
        """)
        
        hotspots = []
        for row in cursor.fetchall():
            hotspots.append(row_to_dict(row, cursor))
        
        return json.dumps(hotspots, default=json_serial)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/hotspots', methods=['POST'])
def create_hotspot():
    data = request.json
    
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        # Create hotspot
        cursor.execute("""
            EXEC sp_InsertHotspotPrediction ?, ?, ?, ?, ?
        """, (
            data.get('locationId'),
            data.get('categoryId'),
            data.get('reportCount'),
            data.get('radiusMeters'),
            data.get('createdByUserId')
        ))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Hotspot created successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

@app.route('/api/hotspots/<int:hotspot_id>', methods=['DELETE'])
def delete_hotspot(hotspot_id):
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        # Soft delete
        cursor.execute("""
            UPDATE HotspotPrediction
            SET Deleted = 1,
                UpdatedOnDate = GETDATE(),
                UpdatedByUserId = 1
            WHERE HotspotId = ?
        """, (hotspot_id,))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Hotspot deleted successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        # Create user
        cursor.execute("""
            EXEC sp_InsertUser ?, ?, ?, ?, ?, ?, ?
        """, (
            data.get('name'),
            data.get('email'),
            data.get('password'),
            data.get('phone'),
            data.get('roleId'),
            data.get('responseTeamId'),
            data.get('createdByUserId')
        ))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "User created successfully"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

@app.route('/api/notifications/user/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT 
                n.NotificationId, n.UserId, n.Message, n.IncidentId, n.HotspotId, 
                n.created_at, n.isRead
            FROM Notifications n
            WHERE n.UserId = ? AND n.Active = 1 AND n.Deleted = 0
            ORDER BY n.created_at DESC
        """, (user_id,))
        
        notifications = []
        for row in cursor.fetchall():
            notifications.append(row_to_dict(row, cursor))
        
        return json.dumps(notifications, default=json_serial)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications/unread/<int:user_id>', methods=['GET'])
def get_unread_notification_count(user_id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM Notifications
            WHERE UserId = ? AND isRead = 0 AND Active = 1 AND Deleted = 0
        """, (user_id,))
        
        result = cursor.fetchone()
        count = result[0] if result else 0
        
        return jsonify({"count": count})
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications/read/<int:user_id>', methods=['PUT'])
def mark_notifications_as_read(user_id):
    conn = None
    cursor = None
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
         
        cursor.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
        conn.autocommit = False
        
        cursor.execute("""
            UPDATE Notifications
            SET isRead = 1,
                UpdatedOnDate = GETDATE(),
                UpdatedByUserId = ?
            WHERE UserId = ? AND isRead = 0
        """, (user_id, user_id))
        
          
        conn.commit()
        
        return jsonify({"success": True, "message": "Notifications marked as read"})
    
    except Exception as e:
          
        if conn:
            conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.autocommit = True
            conn.close()

# Get dashboard stats
@app.route('/api/stats/user/<int:user_id>', methods=['GET'])
def get_user_stats(user_id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        # Get user's incident count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM Incidents
            WHERE UserId = ? AND Deleted = 0
        """, (user_id,))
        
        my_incidents_count = cursor.fetchone()[0]
        
        # Get verified count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM Incidents
            WHERE UserId = ? AND status = 'verified' AND Deleted = 0
        """, (user_id,))
        
        verified_count = cursor.fetchone()[0]
        
        # Get pending count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM Incidents
            WHERE UserId = ? AND status = 'pending' AND Deleted = 0
        """, (user_id,))
        
        pending_count = cursor.fetchone()[0]
        
        # Get hotspots count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM HotspotPrediction
            WHERE Active = 1 AND Deleted = 0
        """)
        
        hotspots_count = cursor.fetchone()[0]
        
        return jsonify({
            "my_incidents_count": my_incidents_count,
            "verified_count": verified_count,
            "pending_count": pending_count,
            "hotspots_count": hotspots_count
        })
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

# Get admin dashboard stats
@app.route('/api/stats/admin', methods=['GET'])
def get_admin_stats():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        # Get total incidents count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM Incidents
            WHERE Deleted = 0
        """)
        
        total_incidents_count = cursor.fetchone()[0]
        
        # Get total users count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM Users
            WHERE Active = 1 AND Deleted = 0
        """)
        
        total_users_count = cursor.fetchone()[0]
        
        # Get total teams count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM ResponseTeam
            WHERE Active = 1 AND Deleted = 0
        """)
        
        total_teams_count = cursor.fetchone()[0]
        
        # Get hotspots count
        cursor.execute("""
            SELECT COUNT(*) AS count
            FROM HotspotPrediction
            WHERE Active = 1 AND Deleted = 0
        """)
        
        hotspots_count = cursor.fetchone()[0]
        
        # Get status counts
        cursor.execute("""
            SELECT 
                SUM(CASE WHEN status = 'pending' OR status = '0' THEN 1 ELSE 0 END) AS pending_count,
                SUM(CASE WHEN status = 'verified' OR status = '2' THEN 1 ELSE 0 END) AS verified_count,
                SUM(CASE WHEN status = 'rejected' OR status = '3' THEN 1 ELSE 0 END) AS rejected_count,
                COUNT(*) AS total_count
            FROM Incidents
            WHERE Deleted = 0
        """)
        
        status_counts = cursor.fetchone()
        pending_count = status_counts[0] or 0
        verified_count = status_counts[1] or 0
        rejected_count = status_counts[2] or 0
        total_count = status_counts[3] or 1  # Avoid division by zero
        
        pending_percent = round((pending_count / total_count) * 100)
        verified_percent = round((verified_count / total_count) * 100)
        rejected_percent = round((rejected_count / total_count) * 100)
        
        return jsonify({
            "total_incidents_count": total_incidents_count,
            "total_users_count": total_users_count,
            "total_teams_count": total_teams_count,
            "hotspots_count": hotspots_count,
            "pending_count": pending_count,
            "verified_count": verified_count,
            "rejected_count": rejected_count,
            "pending_percent": pending_percent,
            "verified_percent": verified_percent,
            "rejected_percent": rejected_percent
        })
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

# Get category stats
@app.route('/api/stats/categories', methods=['GET'])
def get_category_stats():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
          
        cursor.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        cursor.execute("""
            SELECT 
                ic.CategoryId,
                ic.CategoryName,
                COUNT(i.IncidentId) AS count
            FROM IncidentCategory ic
            LEFT JOIN Incidents i ON ic.CategoryId = i.CategoryId AND i.Deleted = 0
            WHERE ic.Active = 1 AND ic.Deleted = 0
            GROUP BY ic.CategoryId, ic.CategoryName
            ORDER BY count DESC
        """)
        
        categories = []
        for row in cursor.fetchall():
            categories.append(row_to_dict(row, cursor))
        
        return jsonify(categories)
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/generate-graphs')
def generate_graphs():
    try:
        generated = graph.generate_all_graphs()
        return jsonify({"success": True, "graphs": generated})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Add this to the end of the file, before the if __name__ == '__main__': line
# Add a column for isRead to the Notifications table if it doesn't exist
# This is a one-time operation when the app starts
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Check if isRead column exists
    cursor.execute("""
        SELECT COUNT(*) 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Notifications' AND COLUMN_NAME = 'isRead'
    """)
    
    if cursor.fetchone()[0] == 0:
        # Add isRead column
        cursor.execute("""
            ALTER TABLE Notifications
            ADD isRead BIT DEFAULT 0
        """)
        conn.commit()
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error checking/adding isRead column: {str(e)}")

if __name__ == '__main__':
    try:
        import graph
        graph.generate_all_graphs()
        print("Graphs generated successfully on startup!")
    except Exception as e:
        print(f"Error generating graphs on startup: {e}")
    app.run(debug=True, port=5000)
