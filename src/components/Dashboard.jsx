import React from 'react';
import { Container, Row, Col, Card, ProgressBar, Badge } from 'react-bootstrap';
import { Landmark, BookmarkCheck, Percent, Layers, Coins, TrendingUp, CalendarDays, CreditCard } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';

export const Dashboard = () => {
  const { slots, bookings } = useParking();

  const totalSlots = slots.length;
  const bookedSlots = slots.filter((slot) => slot.status === 'Booked').length;
  const availableSlots = totalSlots - bookedSlots;
  const occupancyPercentage = Math.round((bookedSlots / totalSlots) * 100);

  const calculateRevenueMetrics = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Compute weekly start and end
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    let todayRevenue = 0, weeklyRevenue = 0, monthlyRevenue = 0, totalRevenue = 0;

    bookings.forEach((b) => {
      if (b.status !== 'Active') return;
      const amt = b.finalAmount || 0;
      totalRevenue += amt;

      if (b.bookingDate === todayStr) todayRevenue += amt;

      const bDate = new Date(b.bookingDate);
      if (!isNaN(bDate.getTime())) {
        if (bDate >= sunday && bDate <= saturday) weeklyRevenue += amt;
        if (bDate.getMonth() === now.getMonth() && bDate.getFullYear() === now.getFullYear()) monthlyRevenue += amt;
      }
    });

    return { todayRevenue, weeklyRevenue, monthlyRevenue, totalRevenue };
  };

  const { todayRevenue, weeklyRevenue, monthlyRevenue, totalRevenue } = calculateRevenueMetrics();

  const occupancyStats = [
    { id: 'stat-total', title: 'Total Capacity', titleClass: 'indigo', value: totalSlots, desc: 'Spaces in system', icon: Layers, iconBg: 'var(--primary-light)', iconColor: 'var(--primary)' },
    { id: 'stat-available', title: 'Available Slots', titleClass: 'emerald', value: availableSlots, desc: 'Ready for booking', icon: Landmark, iconBg: 'var(--success-light)', iconColor: 'var(--success)' },
    { id: 'stat-booked', title: 'Occupied Slots', titleClass: 'rose', value: bookedSlots, desc: 'Currently booked', icon: BookmarkCheck, iconBg: 'var(--danger-light)', iconColor: 'var(--danger)' },
    { id: 'stat-occupancy', title: 'Occupancy Rate', titleClass: 'indigo', value: `${occupancyPercentage}%`, desc: 'Utilization usage', icon: Percent, iconBg: 'var(--primary-light)', iconColor: 'var(--primary)' },
  ];

  const revenueStats = [
    { id: 'rev-today', title: "Today's Revenue", value: `₹${todayRevenue}`, desc: 'Earned today', icon: Coins, highlight: false },
    { id: 'rev-week', title: 'Weekly Revenue', value: `₹${weeklyRevenue}`, desc: 'This calendar week', icon: TrendingUp, highlight: false },
    { id: 'rev-month', title: 'Monthly Revenue', value: `₹${monthlyRevenue}`, desc: 'This calendar month', icon: CalendarDays, highlight: false },
    { id: 'rev-total', title: 'Total Revenue', value: `₹${totalRevenue}`, desc: 'All active bookings', icon: CreditCard, highlight: true },
  ];

  return (
    <Container fluid="lg" className="fade-in py-4">
      <div className="page-header mb-4 animate-slide-down">
        <h1 className="page-title">Dashboard Metrics</h1>
        <p className="page-subtitle">Analyze live utility parameters, real-time spot occupancy and simulated financial ledger.</p>
      </div>

      <div className="mb-4">
        <div className="section-headline mb-3 d-flex align-items-center gap-2">
          <span className="section-indicator" /> <h2 className="section-title mb-0">Simulated Income Analytics</h2>
        </div>
        <Row className="g-3">
          {revenueStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Col xs={12} sm={6} md={3} key={stat.title} className="animate-fade-slide" style={{ animationDelay: `${idx * 80}ms` }}>
                <Card id={stat.id} className={`stat-card revenue-card h-100 ${stat.highlight ? 'highlight border-warning' : 'border-0'}`}>
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="stat-card-row d-flex justify-content-between align-items-center mb-2">
                      <span className="stat-card-title text-uppercase font-sans" style={{ fontSize: '11px', fontWeight: 'bold' }}>{stat.title}</span>
                      {/* <div className="stat-card-icon d-flex align-items-center justify-content-center"><Icon size={14} /></div> */}
                    </div>
                    <div className="stat-card-value my-2" style={{ color: stat.highlight ? 'var(--warning)' : 'white' }}>{stat.value}</div>
                    <Card.Text className="stat-card-desc mb-0" style={{ fontSize: '11px' }}>{stat.desc}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      <div className="mb-4">
        <div className="section-headline mb-3 d-flex align-items-center gap-2">
          <span className="section-indicator" /> <h2 className="section-title mb-0">Slot Occupancy Stats</h2>
        </div>
        <Row className="g-3">
          {occupancyStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Col xs={12} sm={6} md={3} key={stat.title} className="animate-fade-slide" style={{ animationDelay: `${(idx + 4) * 80}ms` }}>
                <Card id={stat.id} className="stat-card border-0 shadow-sm h-100">
                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div className="stat-card-row d-flex justify-content-between align-items-center mb-2">
                      <span className={`stat-card-title ${stat.titleClass} text-uppercase font-sans`} style={{ fontSize: '11px', fontWeight: 'bold' }}>{stat.title}</span>
                      {/* <div className="stat-card-icon d-flex align-items-center justify-content-center" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}><Icon size={14} /></div> */}
                    </div>
                    <div className="stat-card-value my-2">{stat.value}</div>
                    <Card.Text className="stat-card-desc mb-0" style={{ fontSize: '11px' }}>{stat.desc}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* <Card className="utilization-panel border-0 shadow-sm p-4 mb-4 animate-fade-in">
        <Card.Body className="p-0">
          <div className="utilization-header d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
            <div>
              <Card.Title as="h2" className="utilization-heading mb-1">Overall Lot Utilization</Card.Title>
              <Card.Text className="utilization-desc text-muted mb-0">Ratio of occupied spaces relative to total capacity ({totalSlots} slots).</Card.Text>
            </div>
            <div className="utilization-status text-end">
              <span className="utilization-status-title d-block mb-1">Status:</span>
              <span className={`utilization-status-value ${occupancyPercentage === 100 ? 'danger' : occupancyPercentage === 0 ? 'success' : 'warning'} fw-bold`}>
                {occupancyPercentage === 100 ? 'Fully Occupied' : occupancyPercentage === 0 ? 'All Spots Vacant' : 'Partially Occupied'}
              </span>
            </div>
          </div>
          <ProgressBar now={occupancyPercentage} label={`${occupancyPercentage}%`} variant={occupancyPercentage === 100 ? 'danger' : occupancyPercentage === 0 ? 'success' : 'primary'} style={{ height: '14px', borderRadius: '50px', fontWeight: 'bold', fontSize: '10px' }} />
          <div className="utilization-scale d-flex justify-content-between text-muted fs-8 fw-semibold mt-2">
            <span>0% (VACANT)</span> <span>50% (HALFWAY)</span> <span>100% (FULL)</span>
          </div>
        </Card.Body>
      </Card> */}

      <Row className="g-4">
        
        <Col md={6}>
          <Card className="info-widget border-0 shadow-sm p-4 h-100">
            <Card.Body className="p-0">
              <Card.Title as="h3" className="info-widget-title mb-2">Rapid Status Check Map</Card.Title>
              <div className="rapid-check-list d-flex flex-wrap gap-2 mt-2">
                {slots.map((slot) => (
                  <Badge id={`dashboard-slot-preview-${slot.id}`} key={slot.id} bg="transparent" className={`rapid-check-item ${slot.status === 'Booked' ? 'booked' : 'vacant'} text-decoration-none border d-flex align-items-center gap-2`} style={{ flex: '1 0 100px', cursor: 'default' }}>
                    <span className={`dot-status ${slot.status === 'Booked' ? 'booked' : 'vacant'}`} /> <span>{slot.id}</span>
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
