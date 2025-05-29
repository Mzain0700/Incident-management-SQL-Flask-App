import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import pyodbc
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import seaborn as sns

# Set matplotlib to use a non-interactive backend
plt.switch_backend('Agg')

# Database connection string
conn_str = (
    "DRIVER={SQL Server};"
    "SERVER=DESKTOP-E6QS9C9\\SQLEXPRESS;"
    "DATABASE=SafeSpotProject;"
    "Trusted_Connection=yes;"
)

# Create graphs directory if it doesn't exist
GRAPHS_DIR = "static/graphs"
if not os.path.exists(GRAPHS_DIR):
    os.makedirs(GRAPHS_DIR)

def clear_old_graphs():
    """Remove all existing graph files"""
    try:
        for filename in os.listdir(GRAPHS_DIR):
            if filename.endswith(('.png', '.jpg', '.jpeg')):
                os.remove(os.path.join(GRAPHS_DIR, filename))
        print("Old graphs cleared successfully")
    except Exception as e:
        print(f"Error clearing old graphs: {e}")

def generate_user_status_graph(user_id):
    """Generate pie chart for user's incident status distribution"""
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = """
        SELECT 
            CASE 
                WHEN status = 'pending' OR status = '0' THEN 'Pending'
                WHEN status = 'in_progress' OR status = '1' THEN 'In Progress'
                WHEN status = 'verified' OR status = '2' THEN 'Verified'
                WHEN status = 'rejected' OR status = '3' THEN 'Rejected'
                ELSE 'Unknown'
            END as status_name,
            COUNT(*) as count
        FROM Incidents 
        WHERE UserId = ? AND Deleted = 0
        GROUP BY status
        """
        
        cursor.execute(query, (user_id,))
        data = cursor.fetchall()
        
        if not data:
            return None
            
        statuses = [row[0] for row in data]
        counts = [row[1] for row in data]
        
        # Create pie chart
        plt.figure(figsize=(8, 6))
        colors = ["#8269db", "#ff0202", "#32FC0A", "#55E61C"]
        plt.pie(counts, labels=statuses, autopct='%1.1f%%', colors=colors, startangle=90)
        # plt.title(f'My Incidents Status Distribution', fontsize=14, fontweight='bold')
        
        filename = f'user_{user_id}_status_pie.png'
        filepath = os.path.join(GRAPHS_DIR, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        cursor.close()
        conn.close()
        return filename
        
    except Exception as e:
        print(f"Error generating user status graph: {e}")
        return None

def generate_user_category_graph(user_id):
    """Generate bar chart for user's incidents by category"""
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = """
        SELECT ic.CategoryName, COUNT(i.IncidentId) as count
        FROM Incidents i
        JOIN IncidentCategory ic ON i.CategoryId = ic.CategoryId
        WHERE i.UserId = ? AND i.Deleted = 0
        GROUP BY ic.CategoryName
        ORDER BY count DESC
        """
        
        cursor.execute(query, (user_id,))
        data = cursor.fetchall()
        
        if not data:
            return None
            
        categories = [row[0] for row in data]
        counts = [row[1] for row in data]
        
        # Create bar chart
        plt.figure(figsize=(8, 6))
        bars = plt.bar(categories, counts, color="#7e02af", alpha=0.8)
        # plt.title('My Incidents by Category', fontsize=14, fontweight='bold')
        plt.xlabel('Category')
        plt.ylabel('Number of Incidents')
        plt.xticks(rotation=45, ha='right')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom')
        
        filename = f'user_{user_id}_category_bar.png'
        filepath = os.path.join(GRAPHS_DIR, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        cursor.close()
        conn.close()
        return filename
        
    except Exception as e:
        print(f"Error generating user category graph: {e}")
        return None

def generate_admin_status_distribution():
    """Generate pie chart for overall incident status distribution"""
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = """
        SELECT 
            CASE 
                WHEN status = 'pending' OR status = '0' THEN 'Pending'
                WHEN status = 'in_progress' OR status = '1' THEN 'In Progress'
                WHEN status = 'verified' OR status = '2' THEN 'Verified'
                WHEN status = 'rejected' OR status = '3' THEN 'Rejected'
                ELSE 'Unknown'
            END as status_name,
            COUNT(*) as count
        FROM Incidents 
        WHERE Deleted = 0
        GROUP BY status
        """
        
        cursor.execute(query)
        data = cursor.fetchall()
        
        if not data:
            return None
            
        statuses = [row[0] for row in data]
        counts = [row[1] for row in data]
        
        # Create pie chart
        plt.figure(figsize=(8, 6))
        colors = ["#8269db", "#ff0202", "#32FC0A", "#55E61C"]
        plt.pie(counts, labels=statuses, autopct='%1.1f%%', colors=colors, startangle=90)
        # plt.title('Overall Incident Status Distribution', fontsize=14, fontweight='bold')
        
        filename = 'admin_status_distribution.png'
        filepath = os.path.join(GRAPHS_DIR, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        cursor.close()
        conn.close()
        return filename
        
    except Exception as e:
        print(f"Error generating admin status distribution: {e}")
        return None

def generate_admin_category_stats():
    """Generate bar chart for incidents by category"""
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = """
        SELECT ic.CategoryName, COUNT(i.IncidentId) as count
        FROM IncidentCategory ic
        LEFT JOIN Incidents i ON ic.CategoryId = i.CategoryId AND i.Deleted = 0
        WHERE ic.Active = 1 AND ic.Deleted = 0
        GROUP BY ic.CategoryName
        ORDER BY count DESC
        """
        
        cursor.execute(query)
        data = cursor.fetchall()
        
        if not data:
            return None
            
        categories = [row[0] for row in data]
        counts = [row[1] for row in data]
        
        # Create bar chart
        plt.figure(figsize=(8, 6))
        bars = plt.bar(categories, counts, color="#520288", alpha=0.8)
        # plt.title('Incidents by Category', fontsize=14, fontweight='bold')
        plt.xlabel('Category')
        plt.ylabel('Number of Incidents')
        plt.xticks(rotation=45, ha='right')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom')
        
        filename = 'admin_category_stats.png'
        filepath = os.path.join(GRAPHS_DIR, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        cursor.close()
        conn.close()
        return filename
        
    except Exception as e:
        print(f"Error generating admin category stats: {e}")
        return None

def generate_monthly_trends():
    """Generate line chart for monthly incident trends"""
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = """
        SELECT 
            YEAR(CreatedOnDate) as year,
            MONTH(CreatedOnDate) as month,
            COUNT(*) as count
        FROM Incidents 
        WHERE Deleted = 0 AND CreatedOnDate >= DATEADD(month, -12, GETDATE())
        GROUP BY YEAR(CreatedOnDate), MONTH(CreatedOnDate)
        ORDER BY year, month
        """
        
        cursor.execute(query)
        data = cursor.fetchall()
        
        if not data:
            return None
            
        # Create date labels and counts
        dates = []
        counts = []
        
        for row in data:
            year, month, count = row
            dates.append(f"{year}-{month:02d}")
            counts.append(count)
        
        # Create line chart
        plt.figure(figsize=(12, 6))
        plt.plot(dates, counts, marker='o', linewidth=2, markersize=6, color="#3216d1")
        # plt.title('Monthly Incident Trends (Last 12 Months)', fontsize=14, fontweight='bold')
        plt.xlabel('Month')
        plt.ylabel('Number of Incidents')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        
        # Add value labels on points
        for i, count in enumerate(counts):
            plt.text(i, count + 0.5, str(count), ha='center', va='bottom')
        
        filename = 'admin_monthly_trends.png'
        filepath = os.path.join(GRAPHS_DIR, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        cursor.close()
        conn.close()
        return filename
        
    except Exception as e:
        print(f"Error generating monthly trends: {e}")
        return None

def generate_hotspots_distribution():
    """Generate bar chart for hotspots by location"""
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = """
        SELECT l.City, COUNT(h.HotspotId) as count
        FROM HotspotPrediction h
        JOIN Location l ON h.LocationId = l.LocationId
        WHERE h.Active = 1 AND h.Deleted = 0
        GROUP BY l.City
        ORDER BY count DESC
        """
        
        cursor.execute(query)
        data = cursor.fetchall()
        
        if not data:
            return None
            
        cities = [row[0] for row in data]
        counts = [row[1] for row in data]
        
        # Create bar chart
        plt.figure(figsize=(10, 6))
        bars = plt.bar(cities, counts, color="#1b1ed8", alpha=0.8)
        # plt.title('Hotspots Distribution by Location', fontsize=14, fontweight='bold')
        plt.xlabel('City')
        plt.ylabel('Number of Hotspots')
        plt.xticks(rotation=45, ha='right')
        
        # Add value labels on bars
        for bar in bars:
            height = bar.get_height()
            plt.text(bar.get_x() + bar.get_width()/2., height,
                    f'{int(height)}', ha='center', va='bottom')
        
        filename = 'admin_hotspots_distribution.png'
        filepath = os.path.join(GRAPHS_DIR, filename)
        plt.savefig(filepath, dpi=300, bbox_inches='tight', facecolor='white')
        plt.close()
        
        cursor.close()
        conn.close()
        return filename
        
    except Exception as e:
        print(f"Error generating hotspots distribution: {e}")
        return None

def generate_all_graphs():
    """Generate all static graphs"""
    print("Starting graph generation...")
    
    # Clear old graphs first
    clear_old_graphs()
    
    generated_graphs = {}
    
    # Generate user graphs (for user ID 1 as example)
    user_id = 1
    user_status = generate_user_status_graph(user_id)
    if user_status:
        generated_graphs['user_status'] = user_status
        print(f"Generated user status graph: {user_status}")
    
    user_category = generate_user_category_graph(user_id)
    if user_category:
        generated_graphs['user_category'] = user_category
        print(f"Generated user category graph: {user_category}")
    
    # Generate admin graphs
    admin_status = generate_admin_status_distribution()
    if admin_status:
        generated_graphs['admin_status'] = admin_status
        print(f"Generated admin status graph: {admin_status}")
    
    admin_category = generate_admin_category_stats()
    if admin_category:
        generated_graphs['admin_category'] = admin_category
        print(f"Generated admin category graph: {admin_category}")
    
    monthly_trends = generate_monthly_trends()
    if monthly_trends:
        generated_graphs['monthly_trends'] = monthly_trends
        print(f"Generated monthly trends graph: {monthly_trends}")
    
    hotspots = generate_hotspots_distribution()
    if hotspots:
        generated_graphs['hotspots'] = hotspots
        print(f"Generated hotspots graph: {hotspots}")
    
    print(f"Graph generation completed. Generated {len(generated_graphs)} graphs.")
    return generated_graphs

if __name__ == "__main__":
    generate_all_graphs()
