'use client';

import { useState, useEffect } from 'react';

export default function AgendaPage() {
  const mockVehicles = [
    { id: 1, licensePlate: 'ABC1234' },
    { id: 2, licensePlate: 'XYZ5678' }
  ];

  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/agendamentos');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        const transformedAppointments = data.map((appointment: any) => ({
          id: appointment.id,
          title: appointment.title,
          client: getClientById(appointment.clientId)?.nome || '',
          plate: mockVehicles.find(v => v.id === appointment.vehicleId)?.licensePlate || '',
          date: appointment.date,
          mechanic: appointment.mechanic
        }));
        setUpcomingAppointments(transformedAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  function getClientById(clientId: any) {
    const mockClients = [
      { id: 1, nome: 'John Doe' },
      { id: 2, nome: 'Jane Smith' }
    ];

    return mockClients.find(client => client.id === clientId) || null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Agenda</h1>
      <ul>
        {upcomingAppointments.map((appointment) => (
          <li key={appointment.id}>
            {appointment.title} - {appointment.client} - {appointment.plate} - {appointment.date} - {appointment.mechanic}
          </li>
        ))}
      </ul>
    </div>
  );
}
