// Global variables
let currentUser = null
const API_URL = "http://localhost:5000/api"
const allIncidentsBtn = document.getElementById("all-incidents-btn")
const hotspotsBtn = document.getElementById("hotspots-btn")
const notificationsBtn = document.getElementById("notifications-btn")
const allIncidentsSection = document.getElementById("all-incidents")
const hotspotsSection = document.getElementById("hotspots")
const notificationsSection = document.getElementById("notifications")
const notificationBadge = document.getElementById("notification-badge")
const dashboardBtn = document.getElementById("dashboard-btn")
const dashboardOverview = document.getElementById("dashboard-overview")
const adminDashboardBtn = document.getElementById("admin-dashboard-btn")
const adminDashboardOverview = document.getElementById("admin-dashboard-overview")

// DOM Elements
const loginContainer = document.getElementById("login-container")
const userDashboard = document.getElementById("user-dashboard")
const adminDashboard = document.getElementById("admin-dashboard")
const loginForm = document.getElementById("login-form")
const logoutBtn = document.getElementById("logout-btn")
const adminLogoutBtn = document.getElementById("admin-logout-btn")

// User Dashboard Navigation
const viewIncidentsBtn = document.getElementById("view-incidents-btn")
const reportIncidentBtn = document.getElementById("report-incident-btn")
const viewIncidentsSection = document.getElementById("view-incidents")
const reportIncidentSection = document.getElementById("report-incident")

// Admin Dashboard Navigation
const manageIncidentsBtn = document.getElementById("manage-incidents-btn")
const manageUsersBtn = document.getElementById("manage-users-btn")
const manageTeamsBtn = document.getElementById("manage-teams-btn")
const manageIncidentsSection = document.getElementById("manage-incidents")
const manageUsersSection = document.getElementById("manage-users")
const manageTeamsSection = document.getElementById("manage-teams")
const manageHotspotsBtn = document.getElementById("manage-hotspots-btn")
const addUserBtn = document.getElementById("add-user-btn")
const adminNotificationsBtn = document.getElementById("admin-notifications-btn")
const manageHotspotsSection = document.getElementById("manage-hotspots")
const addUserSection = document.getElementById("add-user")
const adminNotificationsSection = document.getElementById("admin-notifications")
const adminNotificationBadge = document.getElementById("admin-notification-badge")

// Dashboard view all buttons
const viewAllIncidents = document.getElementById("view-all-incidents")
const viewAllNotifications = document.getElementById("view-all-notifications")
const adminViewAllIncidents = document.getElementById("admin-view-all-incidents")
const adminViewAllNotifications = document.getElementById("admin-view-all-notifications")

// Sidebar toggles
const userSidebarToggle = document.getElementById("user-sidebar-toggle")
const adminSidebarToggle = document.getElementById("admin-sidebar-toggle")

// Forms
const incidentForm = document.getElementById("incident-form")
const editIncidentForm = document.getElementById("edit-incident-form")
const addUserForm = document.getElementById("add-user-form")
const verificationForm = document.getElementById("verification-form")
const hotspotForm = document.getElementById("hotspot-form")

// Modals
const incidentModal = document.getElementById("incident-modal")
const closeModal = document.querySelector(".close-modal")
const deleteIncidentBtn = document.getElementById("delete-incident-btn")
const verificationModal = document.getElementById("verification-modal")
const closeVerificationModal = document.querySelector(".close-verification-modal")
const hotspotModal = document.getElementById("hotspot-modal")
const closeHotspotModal = document.querySelector(".close-hotspot-modal")
const addHotspotBtn = document.getElementById("add-hotspot-btn")
const modalOverlays = document.querySelectorAll(".modal-overlay")

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  const storedUser = localStorage.getItem("safespot_user")
  if (storedUser) {
    currentUser = JSON.parse(storedUser)
    showDashboard()
  }

  // Add debug logging for form elements
  console.log("Category select:", document.getElementById("category"))
  console.log("Edit category select:", document.getElementById("edit-category"))
  console.log("Edit status select:", document.getElementById("edit-status"))
  console.log("Edit team select:", document.getElementById("edit-team"))
  console.log("Hotspot location select:", document.getElementById("hotspot-location"))
  console.log("Hotspot category select:", document.getElementById("hotspot-category"))

  // Load categories for incident form
  loadCategories()

  // Load response teams for admin forms
  loadResponseTeams()

  // Load locations for hotspot form
  loadLocations()

  // Check for new notifications
  if (currentUser) {
    checkNotifications()
    // Check for new notifications every 30 seconds
    setInterval(checkNotifications, 30000)
  }

  // Add event listeners to modal overlays
  modalOverlays.forEach((overlay) => {
    overlay.addEventListener("click", () => {
      incidentModal.classList.add("hidden")
      verificationModal.classList.add("hidden")
      hotspotModal.classList.add("hidden")
    })
  })

  // Add event listeners to sidebar toggles
  if (userSidebarToggle) {
    userSidebarToggle.addEventListener("click", () => {
      const sidebar = userSidebarToggle.closest(".sidebar")
      sidebar.classList.toggle("collapsed")
    })
  }

  if (adminSidebarToggle) {
    adminSidebarToggle.addEventListener("click", () => {
      const sidebar = adminSidebarToggle.closest(".sidebar")
      sidebar.classList.toggle("collapsed")
    })
  }

  // Add event listeners to refresh buttons
  document.querySelectorAll(".refresh-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.closest(".dashboard-section")

      if (section.id === "view-incidents") {
        loadUserIncidents()
      } else if (section.id === "all-incidents") {
        loadAllIncidentsForUser()
      } else if (section.id === "hotspots") {
        loadHotspotsForUser()
      } else if (section.id === "manage-incidents") {
        loadAllIncidents()
      } else if (section.id === "manage-users") {
        loadAllUsers()
      } else if (section.id === "manage-teams") {
        loadAllTeams()
      } else if (section.id === "manage-hotspots") {
        loadAllHotspots()
      }

      // Add rotation animation
      const icon = btn.querySelector("i")
      if (icon) {
        icon.style.transform = "rotate(360deg)"
        setTimeout(() => {
          icon.style.transform = ""
        }, 500)
      }
    })
  })

  // Add event listeners to view all buttons
  if (viewAllIncidents) {
    viewAllIncidents.addEventListener("click", () => {
      setActiveSection(viewIncidentsBtn, viewIncidentsSection)
      loadUserIncidents()
      updatePageTitle("My Incidents")
    })
  }

  if (viewAllNotifications) {
    viewAllNotifications.addEventListener("click", () => {
      setActiveSection(notificationsBtn, notificationsSection)
      loadUserNotifications()
      updatePageTitle("Notifications")
    })
  }

  if (adminViewAllIncidents) {
    adminViewAllIncidents.addEventListener("click", () => {
      setActiveSection(manageIncidentsBtn, manageIncidentsSection)
      loadAllIncidents()
      updatePageTitle("Manage Incidents")
    })
  }

  if (adminViewAllNotifications) {
    adminViewAllNotifications.addEventListener("click", () => {
      setActiveSection(adminNotificationsBtn, adminNotificationsSection)
      loadAdminNotifications()
      updatePageTitle("Notifications")
    })
  }
})

// Login Form Submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault() // This is crucial to prevent the form from submitting normally

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data = await response.json()
    currentUser = data.user
    localStorage.setItem("safespot_user", JSON.stringify(currentUser))
    showDashboard()
    showToast("success", "Login Successful", "Welcome to SafeSpot Dashboard")
  } catch (error) {
    showToast("error", "Login Failed", "Please check your credentials and try again")
    console.error(error)
  }
})

// Logout Buttons
logoutBtn.addEventListener("click", logout)
adminLogoutBtn.addEventListener("click", logout)

// User Dashboard Navigation
dashboardBtn.addEventListener("click", () => {
  setActiveSection(dashboardBtn, dashboardOverview)
  updatePageTitle("Dashboard Overview")
  loadDashboardOverview()
})

viewIncidentsBtn.addEventListener("click", () => {
  setActiveSection(viewIncidentsBtn, viewIncidentsSection)
  loadUserIncidents()
  updatePageTitle("My Incidents")
})

reportIncidentBtn.addEventListener("click", () => {
  setActiveSection(reportIncidentBtn, reportIncidentSection)
  updatePageTitle("Report Incident")
})

allIncidentsBtn.addEventListener("click", () => {
  setActiveSection(allIncidentsBtn, allIncidentsSection)
  loadAllIncidentsForUser()
  updatePageTitle("All Incidents")
})

hotspotsBtn.addEventListener("click", () => {
  setActiveSection(hotspotsBtn, hotspotsSection)
  loadHotspotsForUser()
  updatePageTitle("Hotspots")
})

notificationsBtn.addEventListener("click", () => {
  setActiveSection(notificationsBtn, notificationsSection)
  loadUserNotifications()
  updatePageTitle("Notifications")
  // Mark notifications as read
  notificationBadge.classList.add("hidden")
})

// Admin Dashboard Navigation
adminDashboardBtn.addEventListener("click", () => {
  setActiveSection(adminDashboardBtn, adminDashboardOverview)
  updatePageTitle("Admin Dashboard Overview")
  loadAdminDashboardOverview()
})

manageIncidentsBtn.addEventListener("click", () => {
  setActiveSection(manageIncidentsBtn, manageIncidentsSection)
  loadAllIncidents()
  updatePageTitle("Manage Incidents")
})

manageUsersBtn.addEventListener("click", () => {
  setActiveSection(manageUsersBtn, manageUsersSection)
  loadAllUsers()
  updatePageTitle("Manage Users")
})

manageTeamsBtn.addEventListener("click", () => {
  setActiveSection(manageTeamsBtn, manageTeamsSection)
  loadAllTeams()
  updatePageTitle("Response Teams")
})

manageHotspotsBtn.addEventListener("click", () => {
  setActiveSection(manageHotspotsBtn, manageHotspotsSection)
  loadAllHotspots()
  updatePageTitle("Manage Hotspots")
})

addUserBtn.addEventListener("click", () => {
  setActiveSection(addUserBtn, addUserSection)
  updatePageTitle("Add User")
  // Load response teams for the form
  loadResponseTeamsForUserForm()
})

adminNotificationsBtn.addEventListener("click", () => {
  setActiveSection(adminNotificationsBtn, adminNotificationsSection)
  loadAdminNotifications()
  updatePageTitle("Notifications")
  // Mark notifications as read
  adminNotificationBadge.classList.add("hidden")
})

// Incident Form Submission
incidentForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = {
    categoryId: document.getElementById("category").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    description: document.getElementById("description").value,
    userId: currentUser.UserId,
  }

  try {
    const response = await fetch(`${API_URL}/incidents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit incident")
    }

    showToast("success", "Incident Reported", "Your incident has been reported successfully")
    incidentForm.reset()
    setActiveSection(viewIncidentsBtn, viewIncidentsSection)
    loadUserIncidents()
    updatePageTitle("My Incidents")
  } catch (error) {
    showToast("error", "Report Failed", "Failed to submit incident. Please try again.")
    console.error(error)
  }
})

// Edit Incident Form Submission
editIncidentForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const incidentId = document.getElementById("edit-incident-id").value
  const categoryId = document.getElementById("edit-category").value
  const status = document.getElementById("edit-status").value
  const responseTeamId = document.getElementById("edit-team").value || null
  const description = document.getElementById("edit-description").value

  console.log("Submitting edit with data:", {
    incidentId,
    categoryId,
    status,
    responseTeamId,
    description,
  })

  const formData = {
    categoryId: categoryId,
    status: status,
    responseTeamId: responseTeamId,
    description: description,
  }

  try {
    const response = await fetch(`${API_URL}/incidents/${incidentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to update incident")
    }

    showToast("success", "Incident Updated", "Incident updated successfully!")
    incidentModal.classList.add("hidden")
    loadAllIncidents()
  } catch (error) {
    showToast("error", "Update Failed", error.message || "Failed to update incident. Please try again.")
    console.error("Error updating incident:", error)
  }
})

// Delete Incident
deleteIncidentBtn.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete this incident?")) {
    return
  }

  const incidentId = document.getElementById("edit-incident-id").value

  try {
    const response = await fetch(`${API_URL}/incidents/${incidentId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete incident")
    }

    showToast("success", "Incident Deleted", "Incident deleted successfully!")
    incidentModal.classList.add("hidden")
    loadAllIncidents()
  } catch (error) {
    showToast("error", "Delete Failed", "Failed to delete incident. Please try again.")
    console.error(error)
  }
})

// Add Hotspot button
addHotspotBtn.addEventListener("click", () => {
  hotspotModal.classList.remove("hidden")
})

// Modal close buttons
closeVerificationModal.addEventListener("click", () => {
  verificationModal.classList.add("hidden")
})

closeHotspotModal.addEventListener("click", () => {
  hotspotModal.classList.add("hidden")
})

// Modal Close Button
closeModal.addEventListener("click", () => {
  incidentModal.classList.add("hidden")
})

// Add User Form Submission
addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = {
    name: document.getElementById("new-user-name").value,
    email: document.getElementById("new-user-email").value,
    password: document.getElementById("new-user-password").value,
    phone: document.getElementById("new-user-phone").value,
    roleId: document.getElementById("new-user-role").value,
    responseTeamId: document.getElementById("new-user-team").value || null,
    createdByUserId: currentUser.UserId,
  }

  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error("Failed to add user")
    }

    showToast("success", "User Added", "User added successfully!")
    addUserForm.reset()
    setActiveSection(manageUsersBtn, manageUsersSection)
    loadAllUsers()
    updatePageTitle("Manage Users")
  } catch (error) {
    showToast("error", "Add User Failed", "Failed to add user. Please try again.")
    console.error(error)
  }
})

// Verification Form Submission
verificationForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const incidentId = document.getElementById("verification-incident-id").value
  const vote = document.querySelector('input[name="vote"]:checked').value

  const formData = {
    incidentId: incidentId,
    userId: currentUser.UserId,
    vote: vote,
  }

  try {
    const response = await fetch(`${API_URL}/verifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit verification")
    }

    showToast("success", "Verification Submitted", "Verification submitted successfully!")
    verificationModal.classList.add("hidden")

    // Reload the appropriate incident list
    if (currentUser.RoleId === 1) {
      loadAllIncidentsForUser()
    } else {
      loadAllIncidents()
    }
  } catch (error) {
    showToast("error", "Verification Failed", "Failed to submit verification. Please try again.")
    console.error(error)
  }
})

// Hotspot Form Submission
hotspotForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = {
    locationId: document.getElementById("hotspot-location").value,
    categoryId: document.getElementById("hotspot-category").value,
    reportCount: document.getElementById("hotspot-count").value,
    radiusMeters: document.getElementById("hotspot-radius").value,
    createdByUserId: currentUser.UserId,
  }

  try {
    const response = await fetch(`${API_URL}/hotspots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error("Failed to add hotspot")
    }

    showToast("success", "Hotspot Added", "Hotspot added successfully!")
    hotspotModal.classList.add("hidden")
    hotspotForm.reset()
    loadAllHotspots()
  } catch (error) {
    showToast("error", "Add Hotspot Failed", "Failed to add hotspot. Please try again.")
    console.error(error)
  }
})

// Functions
function showDashboard() {
  loginContainer.classList.add("hidden")

  if (currentUser.RoleId === 1) {
    // User role
    userDashboard.classList.remove("hidden")
    loadDashboardOverview()
    updatePageTitle("Dashboard Overview")
    setActiveSection(dashboardBtn, dashboardOverview)
    document.querySelector(".user-name").textContent = currentUser.Name || "User"
  } else if (currentUser.RoleId === 2) {
    // Admin role
    adminDashboard.classList.remove("hidden")
    loadAdminDashboardOverview()
    updatePageTitle("Admin Dashboard Overview")
    setActiveSection(adminDashboardBtn, adminDashboardOverview)
    document.querySelector(".admin-sidebar + .main-container .user-name").textContent = currentUser.Name || "Admin"
  }

  // Load all necessary data for forms
  loadCategories()
  loadResponseTeams()
  loadLocations()
}

function logout() {
  localStorage.removeItem("safespot_user")
  currentUser = null
  userDashboard.classList.add("hidden")
  adminDashboard.classList.add("hidden")
  loginContainer.classList.remove("hidden")
  document.getElementById("email").value = ""
  document.getElementById("password").value = ""
  showToast("info", "Logged Out", "You have been successfully logged out")
}

function setActiveSection(button, section) {
  // Update active button
  const sidebarBtns = button.parentElement.querySelectorAll(".sidebar-btn")
  sidebarBtns.forEach((btn) => btn.classList.remove("active"))
  button.classList.add("active")

  // Show selected section
  const sections = section.parentElement.querySelectorAll(".dashboard-section")
  sections.forEach((s) => s.classList.add("hidden"))
  section.classList.remove("hidden")
}

function updatePageTitle(title) {
  const pageTitle = document.querySelector(".page-title")
  if (pageTitle) {
    pageTitle.textContent = title
  }
}

// Fix the loadCategories function to ensure dropdowns are populated correctly
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories`)
    if (!response.ok) {
      throw new Error("Failed to load categories")
    }

    const categories = await response.json()

    // Get all category select elements
    const categorySelects = [
      document.getElementById("category"),
      document.getElementById("edit-category"),
      document.getElementById("hotspot-category"),
    ].filter((el) => el !== null)

    // Clear and populate each select
    categorySelects.forEach((select) => {
      // Clear existing options
      select.innerHTML = '<option value="">-- Select Category --</option>'

      // Add new options
      categories.forEach((category) => {
        const option = document.createElement("option")
        option.value = category.CategoryId
        option.textContent = category.CategoryName
        select.appendChild(option)
      })
    })

    console.log("Categories loaded successfully:", categories.length)
  } catch (error) {
    console.error("Error loading categories:", error)
    showToast("error", "Load Failed", "Failed to load categories")
  }
}

// Fix the loadResponseTeams function to ensure team dropdowns are populated correctly
async function loadResponseTeams() {
  try {
    const response = await fetch(`${API_URL}/teams`)
    if (!response.ok) {
      throw new Error("Failed to load response teams")
    }

    const teams = await response.json()
    const teamSelect = document.getElementById("edit-team")

    if (teamSelect) {
      // Clear existing options
      teamSelect.innerHTML = '<option value="">-- Select Team --</option>'

      // Add new options
      teams.forEach((team) => {
        const option = document.createElement("option")
        option.value = team.ResponseTeamId
        option.textContent = `${team.Name} (${team.Type})`
        teamSelect.appendChild(option)
      })
    }

    console.log("Response teams loaded successfully:", teams.length)
  } catch (error) {
    console.error("Error loading response teams:", error)
    showToast("error", "Load Failed", "Failed to load response teams")
  }
}

async function loadUserIncidents() {
  try {
    const response = await fetch(`${API_URL}/incidents/user/${currentUser.UserId}`)
    if (!response.ok) {
      throw new Error("Failed to load incidents")
    }

    const incidents = await response.json()
    const tableBody = document.getElementById("incidents-table-body")
    tableBody.innerHTML = ""

    if (incidents.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No incidents found</td></tr>`
      return
    }

    incidents.forEach((incident) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${incident.IncidentId}</td>
        <td>${incident.CategoryName}</td>
        <td>${incident.City}</td>
        <td>${incident.Description.substring(0, 50)}${incident.Description.length > 50 ? "..." : ""}</td>
        <td><span class="status-badge status-${incident.status}">${formatStatus(incident.status)}</span></td>
        <td>${new Date(incident.CreatedOnDate).toLocaleDateString()}</td>
      `
      tableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading incidents:", error)
  }
}

async function loadAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users`)
    if (!response.ok) {
      throw new Error("Failed to load users")
    }

    const users = await response.json()
    const tableBody = document.getElementById("users-table-body")
    tableBody.innerHTML = ""

    if (users.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No users found</td></tr>`
      return
    }

    users.forEach((user) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${user.UserId}</td>
        <td>${user.Name}</td>
        <td>${user.Email}</td>
        <td>${user.Phone || "-"}</td>
        <td>${user.RoleName}</td>
        <td>
          <button class="btn btn-primary btn-sm">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
        </td>
      `
      tableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading users:", error)
  }
}

async function loadAllTeams() {
  try {
    const response = await fetch(`${API_URL}/teams`)
    if (!response.ok) {
      throw new Error("Failed to load teams")
    }

    const teams = await response.json()
    const tableBody = document.getElementById("teams-table-body")
    tableBody.innerHTML = ""

    if (teams.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No teams found</td></tr>`
      return
    }

    teams.forEach((team) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${team.ResponseTeamId}</td>
        <td>${team.Name}</td>
        <td>${team.Type}</td>
        <td>${team.ContactEmail}</td>
        <td>${team.ContactPhone}</td>
        <td>${team.City}</td>
        <td>
          <button class="btn btn-primary btn-sm">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
        </td>
      `
      tableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading teams:", error)
  }
}

// Improve the openIncidentModal function to ensure form fields are populated correctly
async function openIncidentModal(incidentId) {
  try {
    const response = await fetch(`${API_URL}/incidents/${incidentId}`)
    if (!response.ok) {
      throw new Error("Failed to load incident details")
    }

    const incident = await response.json()
    console.log("Loaded incident details:", incident)

    // Make sure all form elements exist before setting values
    const idField = document.getElementById("edit-incident-id")
    const categoryField = document.getElementById("edit-category")
    const statusField = document.getElementById("edit-status")
    const teamField = document.getElementById("edit-team")
    const descriptionField = document.getElementById("edit-description")

    if (idField) idField.value = incident.IncidentId

    // Ensure categories are loaded before setting the value
    if (categoryField) {
      // If categories aren't loaded yet, load them first
      if (categoryField.options.length <= 1) {
        await loadCategories()
      }
      categoryField.value = incident.CategoryId
    }

    if (statusField) {
      // Convert numeric status to string if needed
      let statusValue = incident.status
      if (typeof statusValue === "number") {
        if (statusValue === 0) statusValue = "pending"
        else if (statusValue === 1) statusValue = "in_progress"
        else if (statusValue === 2) statusValue = "verified"
        else if (statusValue === 3) statusValue = "rejected"
      }
      statusField.value = statusValue
    }

    if (teamField) {
      // If teams aren't loaded yet, load them first
      if (teamField.options.length <= 1) {
        await loadResponseTeams()
      }
      teamField.value = incident.ResponseTeamId || ""
    }

    if (descriptionField) descriptionField.value = incident.Description

    incidentModal.classList.remove("hidden")
  } catch (error) {
    console.error("Error loading incident details:", error)
    showToast("error", "Load Failed", "Failed to load incident details")
  }
}

// Fix the formatStatus function to handle all status values correctly
function formatStatus(status) {
  if (status === "pending" || status === 0) {
    return "Reported"
  } else if (status === "in_progress" || status === 1) {
    return "In Progress"
  } else if (status === "verified" || status === 2) {
    return "Verified"
  } else if (status === "rejected" || status === 3) {
    return "Rejected"
  } else {
    return "Unknown"
  }
}

async function loadAllIncidentsForUser() {
  try {
    const response = await fetch(`${API_URL}/incidents/all?userId=${currentUser.UserId}`)
    if (!response.ok) {
      throw new Error("Failed to load incidents")
    }

    const incidents = await response.json()
    const tableBody = document.getElementById("all-incidents-table-body")
    tableBody.innerHTML = ""

    if (incidents.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No incidents found</td></tr>`
      return
    }

    incidents.forEach((incident) => {
      // Check if user has already verified this incident
      const hasVerified = incident.userHasVerified || false

      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${incident.IncidentId}</td>
        <td>${incident.CategoryName}</td>
        <td>${incident.City}</td>
        <td>${incident.Description.substring(0, 30)}${incident.Description.length > 30 ? "..." : ""}</td>
        <td><span class="status-badge status-${incident.status}">${formatStatus(incident.status)}</span></td>
        <td>${new Date(incident.CreatedOnDate).toLocaleDateString()}</td>
        <td>
          <div class="verification-counts">
            <span class="true-count" title="Verified True">${incident.trueCount || 0} ✓</span> / 
            <span class="fake-count" title="Verified Fake">${incident.fakeCount || 0} ✗</span>
          </div>
          ${
            !hasVerified
              ? `<button class="btn btn-primary btn-sm verify-incident" data-id="${incident.IncidentId}">
                  <i class="fas fa-check-circle"></i>
                  <span>Verify</span>
                </button>`
              : '<span class="status-verified">You verified</span>'
          }
        </td>
      `
      tableBody.appendChild(row)
    })

    // Add event listeners to verify buttons
    document.querySelectorAll(".verify-incident").forEach((button) => {
      button.addEventListener("click", () => openVerificationModal(button.dataset.id))
    })
  } catch (error) {
    console.error("Error loading incidents:", error)
  }
}

async function loadAllIncidents() {
  try {
    const response = await fetch(`${API_URL}/incidents`)
    if (!response.ok) {
      throw new Error("Failed to load incidents")
    }

    const incidents = await response.json()
    const tableBody = document.getElementById("admin-incidents-table-body")
    tableBody.innerHTML = ""

    if (incidents.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No incidents found</td></tr>`
      return
    }

    incidents.forEach((incident) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${incident.IncidentId}</td>
        <td>${incident.ReportedBy}</td>
        <td>${incident.CategoryName}</td>
        <td>${incident.City}</td>
        <td>${incident.Description.substring(0, 30)}${incident.Description.length > 30 ? "..." : ""}</td>
        <td><span class="status-badge status-${incident.status}">${formatStatus(incident.status)}</span></td>
        <td>${new Date(incident.CreatedOnDate).toLocaleDateString()}</td>
        <td>
          <div class="verification-counts">
            <span class="true-count" title="Verified True">${incident.trueCount || 0} ✓</span> / 
            <span class="fake-count" title="Verified Fake">${incident.fakeCount || 0} ✗</span>
          </div>
          <button class="btn btn-primary btn-sm edit-incident" data-id="${incident.IncidentId}">
            <i class="fas fa-edit"></i>
            <span>Edit</span>
          </button>
        </td>
      `
      tableBody.appendChild(row)
    })

    // Add event listeners to edit buttons
    document.querySelectorAll(".edit-incident").forEach((button) => {
      button.addEventListener("click", () => openIncidentModal(button.dataset.id))
    })
  } catch (error) {
    console.error("Error loading incidents:", error)
  }
}

async function openVerificationModal(incidentId) {
  try {
    const response = await fetch(`${API_URL}/incidents/${incidentId}`)
    if (!response.ok) {
      throw new Error("Failed to load incident details")
    }

    const incident = await response.json()

    document.getElementById("verification-incident-id").value = incident.IncidentId
    document.getElementById("verification-incident-details").textContent =
      `Incident #${incident.IncidentId}: ${incident.Description}`

    verificationModal.classList.remove("hidden")
  } catch (error) {
    console.error("Error loading incident details:", error)
    showToast("error", "Load Failed", "Failed to load incident details")
  }
}

async function loadHotspotsForUser() {
  try {
    const response = await fetch(`${API_URL}/hotspots`)
    if (!response.ok) {
      throw new Error("Failed to load hotspots")
    }

    const hotspots = await response.json()
    const tableBody = document.getElementById("hotspots-table-body")
    tableBody.innerHTML = ""

    if (hotspots.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No hotspots found</td></tr>`
      return
    }

    hotspots.forEach((hotspot) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${hotspot.Address}, ${hotspot.City}</td>
        <td>${hotspot.CategoryName}</td>
        <td>${hotspot.ReportCount}</td>
        <td>${hotspot.RadiusMeters}</td>
        <td>${new Date(hotspot.Predictedt).toLocaleDateString()}</td>
      `
      tableBody.appendChild(row)
    })
  } catch (error) {
    console.error("Error loading hotspots:", error)
  }
}

async function loadAllHotspots() {
  try {
    const response = await fetch(`${API_URL}/hotspots`)
    if (!response.ok) {
      throw new Error("Failed to load hotspots")
    }

    const hotspots = await response.json()
    const tableBody = document.getElementById("admin-hotspots-table-body")
    tableBody.innerHTML = ""

    if (hotspots.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No hotspots found</td></tr>`
      return
    }

    hotspots.forEach((hotspot) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${hotspot.HotspotId}</td>
        <td>${hotspot.Address}, ${hotspot.City}</td>
        <td>${hotspot.CategoryName}</td>
        <td>${hotspot.ReportCount}</td>
        <td>${hotspot.RadiusMeters}</td>
        <td>${new Date(hotspot.Predictedt).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-danger btn-sm delete-hotspot" data-id="${hotspot.HotspotId}">
            <i class="fas fa-trash-alt"></i>
            <span>Delete</span>
          </button>
        </td>
      `
      tableBody.appendChild(row)
    })

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-hotspot").forEach((button) => {
      button.addEventListener("click", () => deleteHotspot(button.dataset.id))
    })
  } catch (error) {
    console.error("Error loading hotspots:", error)
  }
}

async function deleteHotspot(hotspotId) {
  if (!confirm("Are you sure you want to delete this hotspot?")) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/hotspots/${hotspotId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete hotspot")
    }

    showToast("success", "Hotspot Deleted", "Hotspot deleted successfully!")
    loadAllHotspots()
  } catch (error) {
    showToast("error", "Delete Failed", "Failed to delete hotspot. Please try again.")
    console.error(error)
  }
}

// Fix the loadLocations function to ensure location dropdowns are populated correctly
async function loadLocations() {
  try {
    const response = await fetch(`${API_URL}/locations`)
    if (!response.ok) {
      throw new Error("Failed to load locations")
    }

    const locations = await response.json()
    const locationSelect = document.getElementById("hotspot-location")

    if (locationSelect) {
      // Clear existing options
      locationSelect.innerHTML = '<option value="">-- Select Location --</option>'

      // Add new options
      locations.forEach((location) => {
        const option = document.createElement("option")
        option.value = location.LocationId
        option.textContent = `${location.Address}, ${location.City}`
        locationSelect.appendChild(option)
      })
    }

    console.log("Locations loaded successfully:", locations.length)
  } catch (error) {
    console.error("Error loading locations:", error)
    showToast("error", "Load Failed", "Failed to load locations")
  }
}

async function loadResponseTeamsForUserForm() {
  try {
    const response = await fetch(`${API_URL}/teams`)
    if (!response.ok) {
      throw new Error("Failed to load response teams")
    }

    const teams = await response.json()
    const teamSelect = document.getElementById("new-user-team")
    teamSelect.innerHTML = '<option value="">-- None --</option>'

    teams.forEach((team) => {
      const option = document.createElement("option")
      option.value = team.ResponseTeamId
      option.textContent = `${team.Name} (${team.Type})`
      teamSelect.appendChild(option)
    })
  } catch (error) {
    console.error("Error loading response teams:", error)
  }
}

async function loadUserNotifications() {
  try {
    const response = await fetch(`${API_URL}/notifications/user/${currentUser.UserId}`)
    if (!response.ok) {
      throw new Error("Failed to load notifications")
    }

    const notifications = await response.json()
    const container = document.getElementById("user-notifications-container")
    container.innerHTML = ""

    if (notifications.length === 0) {
      container.innerHTML = "<p>No notifications to display.</p>"
      return
    }

    notifications.forEach((notification) => {
      const card = document.createElement("div")
      card.className = `notification-card ${notification.isRead ? "" : "unread"}`
      card.innerHTML = `
        <div class="notification-header">
          <strong>Notification #${notification.NotificationId}</strong>
          <span class="notification-time">${new Date(notification.created_at).toLocaleString()}</span>
        </div>
        <div class="notification-message">${notification.Message}</div>
        ${
          notification.IncidentId
            ? `<div class="notification-actions">
                <button class="btn btn-primary btn-sm view-incident" data-id="${notification.IncidentId}">
                  <i class="fas fa-eye"></i>
                  <span>View Incident</span>
                </button>
              </div>`
            : ""
        }
      `
      container.appendChild(card)
    })

    // Add event listeners to view incident buttons
    document.querySelectorAll(".view-incident").forEach((button) => {
      button.addEventListener("click", () => {
        // Navigate to the incident details
        if (currentUser.RoleId === 1) {
          setActiveSection(allIncidentsBtn, allIncidentsSection)
          loadAllIncidentsForUser()
          updatePageTitle("All Incidents")
        } else {
          setActiveSection(manageIncidentsBtn, manageIncidentsSection)
          loadAllIncidents()
          updatePageTitle("Manage Incidents")
        }
      })
    })

    // Mark notifications as read
    if (notifications.some((n) => !n.isRead)) {
      markNotificationsAsRead(currentUser.UserId)
    }
  } catch (error) {
    console.error("Error loading notifications:", error)
  }
}

async function loadAdminNotifications() {
  try {
    const response = await fetch(`${API_URL}/notifications/user/${currentUser.UserId}`)
    if (!response.ok) {
      throw new Error("Failed to load notifications")
    }

    const notifications = await response.json()
    const container = document.getElementById("admin-notifications-container")
    container.innerHTML = ""

    if (notifications.length === 0) {
      container.innerHTML = "<p>No notifications to display.</p>"
      return
    }

    notifications.forEach((notification) => {
      const card = document.createElement("div")
      card.className = `notification-card ${notification.isRead ? "" : "unread"}`
      card.innerHTML = `
        <div class="notification-header">
          <strong>Notification #${notification.NotificationId}</strong>
          <span class="notification-time">${new Date(notification.created_at).toLocaleString()}</span>
        </div>
        <div class="notification-message">${notification.Message}</div>
        ${
          notification.IncidentId
            ? `<div class="notification-actions">
                <button class="btn btn-primary btn-sm view-incident" data-id="${notification.IncidentId}">
                  <i class="fas fa-eye"></i>
                  <span>View Incident</span>
                </button>
              </div>`
            : ""
        }
        ${
          notification.HotspotId
            ? `<div class="notification-actions">
                <button class="btn btn-primary btn-sm view-hotspot" data-id="${notification.HotspotId}">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>View Hotspot</span>
                </button>
              </div>`
            : ""
        }
      `
      container.appendChild(card)
    })

    // Add event listeners to view buttons
    document.querySelectorAll(".view-incident").forEach((button) => {
      button.addEventListener("click", () => {
        setActiveSection(manageIncidentsBtn, manageIncidentsSection)
        loadAllIncidents()
        updatePageTitle("Manage Incidents")
      })
    })

    document.querySelectorAll(".view-hotspot").forEach((button) => {
      button.addEventListener("click", () => {
        setActiveSection(manageHotspotsBtn, manageHotspotsSection)
        loadAllHotspots()
        updatePageTitle("Manage Hotspots")
      })
    })

    // Mark notifications as read
    if (notifications.some((n) => !n.isRead)) {
      markNotificationsAsRead(currentUser.UserId)
    }
  } catch (error) {
    console.error("Error loading notifications:", error)
  }
}

async function checkNotifications() {
  try {
    const response = await fetch(`${API_URL}/notifications/unread/${currentUser.UserId}`)
    if (!response.ok) {
      throw new Error("Failed to check notifications")
    }

    const data = await response.json()
    const unreadCount = data.count

    if (unreadCount > 0) {
      if (currentUser.RoleId === 1) {
        notificationBadge.textContent = unreadCount
        notificationBadge.classList.remove("hidden")
      } else {
        adminNotificationBadge.textContent = unreadCount
        adminNotificationBadge.classList.remove("hidden")
      }
    }
  } catch (error) {
    console.error("Error checking notifications:", error)
  }
}

async function markNotificationsAsRead(userId) {
  try {
    const response = await fetch(`${API_URL}/notifications/read/${userId}`, {
      method: "PUT",
    })

    if (!response.ok) {
      throw new Error("Failed to mark notifications as read")
    }
  } catch (error) {
    console.error("Error marking notifications as read:", error)
  }
}

// Add a function to load dashboard stats for user
async function loadUserDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/stats/user/${currentUser.UserId}`)
    if (!response.ok) {
      throw new Error("Failed to load user stats")
    }

    const stats = await response.json()

    // Update dashboard stats
    document.getElementById("my-incidents-count").textContent = stats.my_incidents_count
    document.getElementById("verified-count").textContent = stats.verified_count
    document.getElementById("pending-count").textContent = stats.pending_count
    document.getElementById("hotspots-count").textContent = stats.hotspots_count
  } catch (error) {
    console.error("Error loading user dashboard stats:", error)
  }
}

// Update the loadDashboardOverview function to include stats
async function loadDashboardOverview() {
  try {
    // Load user stats
    await loadUserDashboardStats()

    // Fetch incidents
    const incidentsResponse = await fetch(`${API_URL}/incidents/user/${currentUser.UserId}`)
    if (!incidentsResponse.ok) {
      throw new Error("Failed to load incidents")
    }
    const incidents = await incidentsResponse.json()

    // Fetch notifications
    const notificationsResponse = await fetch(`${API_URL}/notifications/user/${currentUser.UserId}`)
    if (!notificationsResponse.ok) {
      throw new Error("Failed to load notifications")
    }
    const notifications = await notificationsResponse.json()

    // Display incidents in the recent incidents table
    const incidentsTableBody = document.getElementById("recent-incidents-table-body")
    if (incidentsTableBody) {
      incidentsTableBody.innerHTML = ""

      if (incidents.length === 0) {
        incidentsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No incidents found</td></tr>`
      } else {
        incidents.slice(0, 5).forEach((incident) => {
          const row = document.createElement("tr")
          row.innerHTML = `
            <td>${incident.IncidentId}</td>
            <td>${incident.CategoryName}</td>
            <td>${incident.City}</td>
            <td><span class="status-badge status-${incident.status}">${formatStatus(incident.status)}</span></td>
            <td>${new Date(incident.CreatedOnDate).toLocaleDateString()}</td>
          `
          incidentsTableBody.appendChild(row)
        })
      }
    }

    // Display notifications
    const notificationsContainer = document.getElementById("recent-notifications-container")
    if (notificationsContainer) {
      notificationsContainer.innerHTML = ""

      if (notifications.length === 0) {
        notificationsContainer.innerHTML = "<p>No notifications to display.</p>"
      } else {
        notifications.slice(0, 5).forEach((notification) => {
          const card = document.createElement("div")
          card.className = `notification-card ${notification.isRead ? "" : "unread"}`
          card.innerHTML = `
            <div class="notification-header">
              <strong>Notification #${notification.NotificationId}</strong>
              <span class="notification-time">${new Date(notification.created_at).toLocaleString()}</span>
            </div>
            <div class="notification-message">${notification.Message}</div>
          `
          notificationsContainer.appendChild(card)
        })
      }
    }

    // Fetch category stats
    const categoryStatsResponse = await fetch(`${API_URL}/stats/categories`)
    if (categoryStatsResponse.ok) {
      const categoryStats = await categoryStatsResponse.json()
      const categoryStatsContainer = document.getElementById("category-stats-container")
      if (categoryStatsContainer) {
        categoryStatsContainer.innerHTML = ""

        if (categoryStats.length === 0) {
          categoryStatsContainer.innerHTML = "<p>No category data available.</p>"
        } else {
          // Get the total count for percentage calculation
          const totalCount = categoryStats.reduce((sum, category) => sum + category.count, 0) || 1

          categoryStats.forEach((category, index) => {
            const colors = ["#4361ee", "#f72585", "#4cc9f0", "#f8961e", "#06d6a0", "#7209b7", "#d81b60"]
            const color = colors[index % colors.length]
            const percent = Math.round((category.count / totalCount) * 100)

            const categoryItem = document.createElement("div")
            categoryItem.className = "category-item"
            categoryItem.innerHTML = `
              <div class="category-icon" style="background-color: ${color}">
                <i class="fas fa-tag"></i>
              </div>
              <div class="category-details">
                <div class="category-name">${category.CategoryName}</div>
                <div class="category-count">${category.count} incidents</div>
              </div>
              <div class="category-progress">
                <div class="category-progress-bar" style="width: ${percent}%; background-color: ${color}"></div>
              </div>
            `
            categoryStatsContainer.appendChild(categoryItem)
          })
        }
      }
    }
  } catch (error) {
    console.error("Error loading dashboard overview:", error)
  }
}

// Fix the loadAdminDashboardOverview function to properly load dashboard statistics
async function loadAdminDashboardOverview() {
  try {
    // Fetch admin stats
    const statsResponse = await fetch(`${API_URL}/stats/admin`)
    if (!statsResponse.ok) {
      throw new Error("Failed to load admin stats")
    }
    const stats = await statsResponse.json()

    // Update dashboard stats
    document.getElementById("total-incidents-count").textContent = stats.total_incidents_count
    document.getElementById("total-users-count").textContent = stats.total_users_count
    document.getElementById("total-teams-count").textContent = stats.total_teams_count
    document.getElementById("admin-hotspots-count").textContent = stats.hotspots_count

    // Update status chart
    document.getElementById("pending-chart-bar").style.height = `${stats.pending_percent}%`
    document.getElementById("verified-chart-bar").style.height = `${stats.verified_percent}%`
    document.getElementById("rejected-chart-bar").style.height = `${stats.rejected_percent}%`
    document.getElementById("pending-percent").textContent = `${stats.pending_percent}%`
    document.getElementById("verified-percent").textContent = `${stats.verified_percent}%`
    document.getElementById("rejected-percent").textContent = `${stats.rejected_percent}%`

    // Fetch incidents
    const incidentsResponse = await fetch(`${API_URL}/incidents`)
    if (!incidentsResponse.ok) {
      throw new Error("Failed to load incidents")
    }
    const incidents = await incidentsResponse.json()

    // Fetch notifications
    const notificationsResponse = await fetch(`${API_URL}/notifications/user/${currentUser.UserId}`)
    if (!notificationsResponse.ok) {
      throw new Error("Failed to load notifications")
    }
    const notifications = await notificationsResponse.json()

    // Display incidents
    const incidentsTableBody = document.getElementById("admin-recent-incidents-table-body")
    incidentsTableBody.innerHTML = ""

    if (incidents.length === 0) {
      incidentsTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No incidents found</td></tr>`
    } else {
      incidents.slice(0, 5).forEach((incident) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${incident.IncidentId}</td>
          <td>${incident.ReportedBy || "Unknown"}</td>
          <td>${incident.CategoryName}</td>
          <td>${incident.City}</td>
          <td><span class="status-badge status-${incident.status}">${formatStatus(incident.status)}</span></td>
          <td>${new Date(incident.CreatedOnDate).toLocaleDateString()}</td>
        `
        incidentsTableBody.appendChild(row)
      })
    }

    // Display notifications
    const notificationsContainer = document.getElementById("admin-recent-notifications-container")
    notificationsContainer.innerHTML = ""

    if (notifications.length === 0) {
      notificationsContainer.innerHTML = "<p>No notifications to display.</p>"
    } else {
      notifications.slice(0, 5).forEach((notification) => {
        const card = document.createElement("div")
        card.className = `notification-card ${notification.isRead ? "" : "unread"}`
        card.innerHTML = `
          <div class="notification-header">
            <strong>Notification #${notification.NotificationId}</strong>
            <span class="notification-time">${new Date(notification.created_at).toLocaleString()}</span>
          </div>
          <div class="notification-message">${notification.Message}</div>
        `
        notificationsContainer.appendChild(card)
      })
    }

    // Fetch category stats
    const categoryStatsResponse = await fetch(`${API_URL}/stats/categories`)
    if (categoryStatsResponse.ok) {
      const categoryStats = await categoryStatsResponse.json()
      const categoryStatsContainer = document.getElementById("category-stats-container")
      categoryStatsContainer.innerHTML = ""

      if (categoryStats.length === 0) {
        categoryStatsContainer.innerHTML = "<p>No category data available.</p>"
      } else {
        // Get the total count for percentage calculation
        const totalCount = categoryStats.reduce((sum, category) => sum + category.count, 0) || 1

        categoryStats.forEach((category, index) => {
          const colors = ["#4361ee", "#f72585", "#4cc9f0", "#f8961e", "#06d6a0", "#7209b7", "#d81b60"]
          const color = colors[index % colors.length]
          const percent = Math.round((category.count / totalCount) * 100)

          const categoryItem = document.createElement("div")
          categoryItem.className = "category-item"
          categoryItem.innerHTML = `
            <div class="category-icon" style="background-color: ${color}">
              <i class="fas fa-tag"></i>
            </div>
            <div class="category-details">
              <div class="category-name">${category.CategoryName}</div>
              <div class="category-count">${category.count} incidents</div>
            </div>
            <div class="category-progress">
              <div class="category-progress-bar" style="width: ${percent}%; background-color: ${color}"></div>
            </div>
          `
          categoryStatsContainer.appendChild(categoryItem)
        })
      }
    }
  } catch (error) {
    console.error("Error loading admin dashboard overview:", error)
    showToast("error", "Dashboard Error", "Failed to load dashboard data")
  }
}

// Improve the showToast function to handle errors better
function showToast(type, title, message) {
  const toastContainer = document.getElementById("toast-container")
  if (!toastContainer) {
    console.error("Toast container not found")
    return
  }

  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast ${type}`

  // Create toast content
  toast.innerHTML = `
    <div class="toast-icon ${type}">
      <i class="fas fa-${type === "success" ? "check" : type === "error" ? "exclamation" : "info"}-circle"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `

  // Add to container
  toastContainer.appendChild(toast)

  // Add close functionality
  const closeBtn = toast.querySelector(".toast-close")
  closeBtn.addEventListener("click", () => {
    toast.classList.add("hide")
    setTimeout(() => {
      toast.remove()
    }, 300)
  })

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add("hide")
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 5000)
}

// Add status badge styles
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style")
  style.textContent = `
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
    }
    .status-0 {
      background-color: rgba(248, 150, 30, 0.15);
      color: #f8961e;
    }
    .status-1 {
      background-color: rgba(72, 149, 239, 0.15);
      color: #4895ef;
    }
    .status-2 {
      background-color: rgba(76, 201, 240, 0.15);
      color: #4cc9f0;
    }
    .status-3 {
      background-color: rgba(39, 174, 96, 0.15);
      color: #27ae60;
    }
  `
  document.head.appendChild(style)
})
