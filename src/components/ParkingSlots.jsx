import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { ShieldCheck, ShieldAlert, CircleUser, Ticket, Clock } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';

export const ParkingSlots = () => {
  const { slots, bookings } = useParking();

  // Find the active booking for a slot
  const getActiveBookingForSlot = (slotId) => {
    return bookings.find((b) => b.slotNumber === slotId && b.status === 'Active');
  };

  return (
    <Container fluid="lg" className="fade-in py-4">
      {/* Header section */}
      <div className="page-header mb-4 animate-slide-down">
        <h1 className="page-title">Parking Slots</h1>
        <p className="page-subtitle">
          Monitor real-time occupancy status of individual spots.
        </p>
      </div>

      {/* Grid of slots (React Bootstrap Row / Col / Card) */}
      <Row className="g-4 mb-4">
        {slots.map((slot, index) => {
          const activeBooking = getActiveBookingForSlot(slot.id);
          const isBooked = slot.status === 'Booked';

          return (
            <Col xs={12} sm={6} md={4} key={slot.id} className="animate-fade-slide" style={{ animationDelay: `${index * 100}ms` }}>
              <Card
                id={`slot-card-${slot.id}`}
                className={`slot-visual-card h-100 ${isBooked ? 'booked border-danger' : 'vacant border-success'}`}
              >
                <Card.Body className="d-flex flex-column justify-content-between p-4">
                  <div>
                    {/* Visual header */}
                    <div className="slot-card-header d-flex justify-content-between align-items-center mb-3">
                      <span className="slot-card-id fw-bold h4 m-0 font-display">
                        {slot.id}
                      </span>
                      <div className="slot-card-icon-indicator d-flex align-items-center justify-content-center">
                        {isBooked ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                      </div>
                    </div>

                    {/* Status indicator badge */}
                    <div id={`slot-status-${slot.id}`} className="mb-3">
                      <Badge 
                        bg={isBooked ? "danger" : "success"} 
                        className="slot-card-status-badge d-inline-flex align-items-center gap-1 border-0"
                      >
                        {!isBooked && <span className="pulse-indicator me-1" />}
                        {slot.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Occupant content */}
                  <div className="slot-occupant-pane border-top pt-3">
                    {isBooked && activeBooking ? (
                      <div className="slot-details-list d-flex flex-column gap-2">
                        <div className="slot-details-row d-flex align-items-center gap-2" title="Occupant Name">
                          <CircleUser size={14} className="text-secondary" />
                          <div>
                            <span className="slot-details-label text-uppercase text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>Occupant</span>
                            <span className="slot-details-value fw-semibold d-block text-slate-800">{activeBooking.customerName}</span>
                          </div>
                        </div>
                        <div className="slot-details-row d-flex align-items-center gap-2" title="Vehicle Registration">
                          <Ticket size={14} className="text-secondary" />
                          <div>
                            <span className="slot-details-label text-uppercase text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>Plate</span>
                            <span className="slot-details-value highlight fw-bold d-block text-danger">{activeBooking.vehicleNumber}</span>
                          </div>
                        </div>
                        <div className="slot-details-row d-flex align-items-center gap-2" title="Reservation Time">
                          <Clock size={14} className="text-secondary" />
                          <div>
                            <span className="slot-details-label text-uppercase text-muted" style={{ fontSize: '9px', fontWeight: 'bold' }}>Entry Time</span>
                            <span className="slot-details-value fw-semibold d-block text-slate-800">{activeBooking.entryTime}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="slot-vacant-placeholder text-center py-2">
                        <p className="slot-vacant-primary text-muted fst-italic mb-1">Vacant Spot</p>
                        <p className="slot-vacant-secondary text-success font-monospace mb-0 fs-9 fw-bold">READY FOR RESERVATION</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      
    </Container>
  );
};

