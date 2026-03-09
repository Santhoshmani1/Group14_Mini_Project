import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

interface Course {
  id: number;
  title: string;
  status: string;
  price: number;
  instructor: {
    firstname: string;
    lastname: string;
    email: string;
  };
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchCourses = async (statusFilter = '') => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/courses${statusFilter ? `?status=${statusFilter}` : ''}`);
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(filter);
  }, [filter]);

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/admin/courses/${id}/approve`);
      fetchCourses(filter);
    } catch (err) {
      console.error('Failed to approve course:', err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      if (confirm('Are you sure you want to reject this course? It will be sent back to draft.')) {
        await api.patch(`/admin/courses/${id}/reject`);
        fetchCourses(filter);
      }
    } catch (err) {
      console.error('Failed to reject course:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (confirm('Warning: Are you absolutely sure you want to permanently delete this course?')) {
        await api.delete(`/admin/courses/${id}`);
        fetchCourses(filter);
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Course Moderation</h2>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Courses</option>
          <option value="draft">Review (Drafts)</option>
          <option value="published">Published</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Instructor</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading courses...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No courses match the criteria</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 text-gray-500">{course.instructor?.firstname} {course.instructor?.lastname}</td>
                  <td className="px-6 py-4 text-gray-500">${course.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {course.status !== 'published' && (
                      <button
                        onClick={() => handleApprove(course.id)}
                        className="text-sm font-medium px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors border border-green-200"
                      >
                        Approve
                      </button>
                    )}
                    {course.status !== 'draft' && (
                      <button
                        onClick={() => handleReject(course.id)}
                        className="text-sm font-medium px-3 py-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-md transition-colors border border-yellow-200"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="text-sm font-medium px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;
