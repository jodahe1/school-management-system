document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#admins-table tbody');
    const searchInput = document.getElementById('admin-search');
    const message = document.getElementById('admin-message');
    let admins = [];
    let filteredAdmins = [];

    // Fetch all admins
    async function fetchAdmins() {
        try {
            const res = await fetch('http://localhost:5000/api/admin/admins');
            const data = await res.json();
            admins = data.filter(user => user.role === 'admin');
            filteredAdmins = admins;
            renderTable();
        } catch (err) {
            message.textContent = 'Failed to load admins.';
            message.style.color = 'red';
        }
    }

    // Render table rows
    function renderTable() {
        tableBody.innerHTML = '';
        if (filteredAdmins.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No admins found.</td></tr>';
            return;
        }
        filteredAdmins.forEach(admin => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:0.75rem;">${admin.username}</td>
                <td style="padding:0.75rem;">${admin.email}</td>
                <td style="padding:0.75rem;">
                    <button class="delete-admin-btn" data-id="${admin.user_id}" style="background:#ef4444;color:#fff;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-admin-btn').forEach(btn => {
            btn.onclick = async function() {
                const adminId = this.dataset.id;
                const admin = admins.find(a => a.user_id == adminId);
                if (!admin) return;
                if (!confirm(`Are you sure you want to delete admin '${admin.username}'?`)) return;
                try {
                    const res = await fetch(`http://localhost:5000/api/admin/admins/${adminId}/delete`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        message.textContent = `Admin '${admin.username}' deleted successfully.`;
                        message.style.color = 'green';
                        admins = admins.filter(a => a.user_id != adminId);
                        filteredAdmins = admins.filter(a => filterAdmin(a, searchInput.value));
                        renderTable();
                    } else {
                        const result = await res.json();
                        message.textContent = result.message || 'Failed to delete admin.';
                        message.style.color = 'red';
                    }
                } catch (err) {
                    message.textContent = 'Network error. Please try again.';
                    message.style.color = 'red';
                }
            };
        });
    }

    // Filter function
    function filterAdmin(admin, query) {
        query = query.toLowerCase();
        return (
            admin.username.toLowerCase().includes(query) ||
            admin.email.toLowerCase().includes(query)
        );
    }

    // Search event
    searchInput.addEventListener('input', function() {
        const query = this.value;
        filteredAdmins = admins.filter(a => filterAdmin(a, query));
        renderTable();
    });

    fetchAdmins();
}); 