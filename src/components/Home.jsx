import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Car, LayoutDashboard, CalendarPlus, Shield, Clock, Database } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';

export const Home = () => {
  const { slots } = useParking();
  const navigate = useNavigate();

  const totalSlots = slots.length;
  const availableSlots = slots.filter((slot) => slot.status === 'Available').length;

  const quickActions = [
    {
      title: 'Dashboard Metrics',
      desc: 'View real-time slot occupancy, total capacity, and a complete financial breakdown of simulated revenue.',
      icon: LayoutDashboard,
      path: '/dashboard',
      cardStyle: 'indigo',
    },
    {
      title: 'Book a Parking Spot',
      desc: 'Reserve a spot for various vehicle types with dynamic rate calculators, additional services, and promo codes.',
      icon: CalendarPlus,
      path: '/book',
      cardStyle: 'emerald',
    },
    {
      title: 'Interactive Slot Map',
      desc: 'See which spots are currently occupied or vacant in a clean and visual bird\'s-eye view mockup layout.',
      icon: Car,
      path: '/slots',
      cardStyle: 'slate',
    },
  ];

  return (
    <Container fluid="lg" className="fade-in py-4">
      {/* Main Hero Header */}
      <div className="home-hero text-center mb-5">
        
        <h1 className="home-title animate-slide-down">
          Smart Parking<br />
          <span>Management System</span>
        </h1>
        <p className="home-description mx-auto animate-fade-in" style={{ maxWidth: '680px' }}>
          Easily manage reservations, calculate fees, track occupied slots, and generate printed receipts. An all-in-one local manager for simplified vehicle dispatch.
        </p>

        {/* Capacity Status Badge */}
        <div className="home-capacity-container animate-pulse-border">
          <span className="home-capacity-label">Lot Status:</span>
          <span className="home-capacity-item">
            <Clock size={14} className="me-1" />
            Total Slots: {totalSlots}
          </span>
          <span
            id="quick-available-badge"
            className={`home-capacity-item ${availableSlots > 0 ? 'available' : 'full'}`}
          >
            {availableSlots > 0 ? (
              <>
                <span className="pulse-indicator me-1" />
                {availableSlots} Spots Available
              </>
            ) : (
              'Lot Fully Occupied'
            )}
          </span>
        </div>
      </div>

      {/* Dynamic Action Grid (React Bootstrap Row / Col / Card) */}
      <Row className="g-4 mb-5 justify-content-center">
        {quickActions.map((act, index) => {
          const Icon = act.icon;
          return (
            <Col md={4} key={act.title} className="d-flex align-items-stretch animate-fade-slide" style={{ animationDelay: `${index * 150}ms` }}>
              <Card
                className={`home-action-card w-100 border-0 ${act.cardStyle} h-100 flex-column justify-content-between`}
                onClick={() => navigate(act.path)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className="d-flex flex-column justify-content-between h-100">
                  <div className="action-card-header">
                    <div className="action-card-icon d-flex align-items-center justify-content-center">
                      <Icon size={20} />
                    </div>
                    <Card.Title as="h3" className="action-card-title">{act.title}</Card.Title>
                    <Card.Text className="action-card-desc">{act.desc}</Card.Text>
                  </div>
                  <div className="mt-auto pt-3">
                    <Button
                      id={`home-action-btn-${act.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="btn btn-primary border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(act.path);
                      }}
                      style={{
                        fontSize: '11px',
                        padding: '8px 16px',
                        width: 'auto',
                        backgroundColor: act.cardStyle === 'indigo' ? 'var(--primary)' : act.cardStyle === 'emerald' ? 'var(--success)' : 'var(--secondary)'
                      }}
                    >
                      Open Section &rarr;
                    </Button>
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

