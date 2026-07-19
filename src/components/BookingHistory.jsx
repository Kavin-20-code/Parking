import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Table, Button, Modal, Badge, InputGroup } from 'react-bootstrap';
import { Search, Eye, FileText, ArrowUpDown, Inbox, Printer } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';

export const BookingHistory = () => {
  const { bookings } = useParking();

  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [sortOption, setSortOption] = useState('desc');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filteredBookings = bookings.filter(b => 
    b.customerName.toLowerCase().includes(customerSearch.toLowerCase().trim()) &&
    b.vehicleNumber.toUpperCase().includes(vehicleSearch.toUpperCase().trim())
  ).sort((a, b) => {
    const diff = new Date(`${a.bookingDate}T${a.entryTime}`) - new Date(`${b.bookingDate}T${b.entryTime}`);
    return sortOption === 'desc' ? -diff : diff;
  });

  const handlePrintInvoice = () => {
    const style = document.createElement('style');
    style.id = 'temp-print-sheet';
    style.innerHTML = `@media print { body * { visibility: hidden !important; } #printable-invoice-card, #printable-invoice-card * { visibility: visible !important; } #printable-invoice-card { position: absolute !important; left: 0; top: 0; width: 100%; color: #000; background: #fff; border: none; padding: 30px !important; } .no-print { display: none !important; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById('temp-print-sheet')?.remove(), 500);
  };

  return (
    <Container fluid="lg" className="fade-in py-4">
      <div className="page-header mb-4 animate-slide-down">
        <h1 className="page-title">Booking Logs</h1>
        <p className="page-subtitle">View past database entries, search records, or download transaction invoice receipts.</p>
      </div>

      <Card className="search-filter-card shadow-sm border-0 p-4 mb-4 animate-fade-in">
        <Card.Body className="p-0">
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label htmlFor="customer-search-input" className="form-label fs-9 fw-semibold text-slate-700 text-uppercase mb-2">Search Customer Name</Form.Label>
                <InputGroup className="form-input-container">
                  <InputGroup.Text className="bg-transparent border-end-0 text-secondary" style={{ borderRight: 'none' }}><Search size={14} /></InputGroup.Text>
                  <Form.Control
                    id="customer-search-input" type="text" placeholder="Filter by customer name..."
                    value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
                    className="border-start-0 ps-0" style={{ fontSize: '12px' }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label htmlFor="vehicle-search-input" className="form-label fs-9 fw-semibold text-slate-700 text-uppercase mb-2">Search Vehicle Number</Form.Label>
                <InputGroup className="form-input-container">
                  <InputGroup.Text className="bg-transparent border-end-0 text-secondary" style={{ borderRight: 'none' }}><Search size={14} /></InputGroup.Text>
                  <Form.Control
                    id="vehicle-search-input" type="text" placeholder="e.g. TN30 or KA01..."
                    value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)}
                    className="border-start-0 ps-0" style={{ fontSize: '12px' }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label htmlFor="booking-sort-dropdown" className="form-label fs-9 fw-semibold text-slate-700 text-uppercase mb-2">Sort by Date & Arrival</Form.Label>
                <InputGroup className="form-input-container">
                  <InputGroup.Text className="bg-transparent border-end-0 text-secondary" style={{ borderRight: 'none' }}><ArrowUpDown size={14} /></InputGroup.Text>
                  <Form.Select
                    id="booking-sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}
                    className="border-start-0 ps-0" style={{ fontSize: '12px', cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="desc">Newest Booking First</option>
                    <option value="asc">Oldest Booking First</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="custom-table-container border-0 shadow-sm overflow-hidden animate-fade-in">
        <Card.Body className="p-0">
          {filteredBookings.length > 0 ? (
            <Table id="booking-history-table" hover responsive className="m-0 border-0 align-middle">
              <thead className="bg-light border-bottom">
                <tr className="custom-table-header text-uppercase text-secondary fs-8 fw-bold">
                  <th className="px-4 py-3 text-start">Customer Name</th>
                  <th className="px-4 py-3 text-start">Vehicle (Type)</th>
                  <th className="px-4 py-3 text-center">Bay Slot</th>
                  <th className="px-4 py-3 text-start">Timeline</th>
                  <th className="px-4 py-3 text-center">Duration</th>
                  <th className="px-4 py-3 text-end">Grand Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b, index) => (
                  <tr id={`booking-row-${b.id}`} key={b.id} className="custom-table-row border-bottom animate-fade-slide" style={{ animationDelay: `${index * 30}ms` }}>
                    <td className="px-4 py-3 text-start">
                      <span className="fw-semibold d-block text-slate-800 fs-7">{b.customerName}</span>
                      <span className="d-block text-muted font-monospace mt-1" style={{ fontSize: '10px' }}>+91 {b.mobileNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-start">
                      <span className="font-monospace fw-bold text-uppercase text-primary fs-7">{b.vehicleNumber}</span>
                      <span className="d-block mt-1 text-muted fs-9">
                        <Badge bg="secondary" className="px-2 py-1 text-white uppercase" style={{ fontSize: '8px' }}>{b.vehicleType === 'ElectricVehicle' ? 'Electric Vehicle' : (b.vehicleType || 'Car')}</Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge bg="light" className="text-secondary font-monospace border py-2 px-3 fs-7" style={{ borderRadius: '6px' }}>{b.slotNumber}</Badge>
                    </td>
                    <td className="text-start fs-8 text-secondary">
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                          <Badge bg="success-subtle" className="text-success uppercase p-1" style={{ fontSize: '8px', fontWeight: 'bold' }}>IN</Badge>
                          <span className="text-slate-700">{b.bookingDate} {b.entryTime}</span>
                        </div>
                        {b.exitDate && (
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg="danger-subtle" className="text-danger uppercase p-1" style={{ fontSize: '8px', fontWeight: 'bold' }}>OUT</Badge>
                            <span className="text-muted">{b.exitDate} {b.exitTime}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-monospace fs-7 text-slate-700 fw-semibold">{b.duration || 1} hrs</td>
                    <td className="px-4 py-3 text-end font-monospace fw-bold text-primary fs-7">₹{b.finalAmount !== undefined ? b.finalAmount : 20}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge bg={b.status === 'Active' ? 'success' : b.status === 'Completed' ? 'secondary' : 'danger'} className="px-3 py-1 text-uppercase rounded-pill" style={{ fontSize: '9px', fontWeight: 'bold' }}>{b.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        id={`view-details-${b.id}`} variant="outline-primary" size="sm" onClick={() => setSelectedBooking(b)}
                        className="d-inline-flex align-items-center gap-1 border-0" style={{ fontSize: '11px', borderRadius: '4px' }}
                      >
                        <Eye size={12} /> <span>Invoice</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div id="empty-booking-logs" className="py-5 text-center text-muted">
              <Inbox size={42} className="text-secondary-subtle mb-3 animate-pulse" />
              <Card.Title as="h5" className="text-slate-800 mb-1 fs-6">No Records Found</Card.Title>
              <Card.Text className="fs-7 text-muted">Reserve space from the Book Parking panel to generate invoices.</Card.Text>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={selectedBooking !== null} onHide={() => setSelectedBooking(null)} centered animation={true}>
        <Modal.Header className="border-0 pb-0 no-print" closeButton>
          <Modal.Title className="fs-6 text-uppercase text-muted fw-bold tracking-wider d-flex align-items-center gap-2">
            <FileText size={18} className="text-primary" /> <span>Invoice Statement</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedBooking && (
            <div id="printable-invoice-card" className="invoice-body">
              <div className="invoice-letterhead text-center pb-4 mb-4 border-bottom">
                <span className="invoice-letterhead-tag text-uppercase badge bg-light text-secondary border px-2 py-1 mb-2 fs-9" style={{ fontWeight: 'bold' }}>Payment Receipt</span>
                <h2 className="invoice-letterhead-title h3 fw-bold text-primary font-display mb-1">ParkEasy Parking LLC</h2>
                <span className="text-secondary font-monospace d-block fs-8">Date: {selectedBooking.bookingDate}</span>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold mb-1">Invoice Ref ID</span>
                  <span className="invoice-ref-val font-monospace fw-semibold text-slate-800 fs-7">{selectedBooking.id}</span>
                </div>
                <Badge bg={selectedBooking.status === 'Active' ? 'success' : selectedBooking.status === 'Completed' ? 'secondary' : 'danger'} className="px-3 py-2 text-uppercase fs-9 rounded-pill">{selectedBooking.status}</Badge>
              </div>

              <Row className="g-3 mb-4 p-3 bg-light rounded" style={{ border: '1px solid #e2e8f0' }}>
                <Col xs={6}>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Customer</span>
                  <span className="invoice-ref-val fw-semibold text-slate-800 fs-7">{selectedBooking.customerName}</span>
                </Col>
                <Col xs={6}>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Device SMS</span>
                  <span className="invoice-ref-val font-monospace text-slate-800 fs-7">+91 {selectedBooking.mobileNumber}</span>
                </Col>
                <Col xs={6}>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Reg Number</span>
                  <span className="invoice-ref-val font-monospace fw-bold text-danger fs-7 text-uppercase">{selectedBooking.vehicleNumber}</span>
                </Col>
                <Col xs={6}>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Category</span>
                  <span className="invoice-ref-val fw-semibold text-slate-800 fs-7">{selectedBooking.vehicleType}</span>
                </Col>
                <Col xs={6}>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Bay Slot</span>
                  <span className="invoice-ref-val font-monospace fw-bold text-primary fs-7">Slot {selectedBooking.slotNumber}</span>
                </Col>
                <Col xs={6}>
                  <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Check-In</span>
                  <span className="invoice-ref-val text-slate-800 fs-8">{selectedBooking.bookingDate} {selectedBooking.entryTime}</span>
                </Col>
              </Row>

              <div className="invoice-pricing-area p-3 bg-light rounded border mb-4">
                <table className="pricing-table w-100">
                  <tbody>
                    <tr className="pricing-table-row border-bottom py-1 fs-8 text-secondary">
                      <td className="py-2">Hourly base rate</td>
                      <td className="text-end py-2">{selectedBooking.duration || 1} hrs</td>
                    </tr>
                    <tr className="pricing-table-row border-bottom py-1 fs-8 text-secondary">
                      <td className="py-2">Base Fee</td>
                      <td className="text-end py-2">₹{selectedBooking.parkingFee || 20}</td>
                    </tr>
                    {selectedBooking.additionalCharges > 0 && (
                      <tr className="pricing-table-row border-bottom py-1 fs-8 text-secondary">
                        <td className="py-2">Premium Services</td>
                        <td className="text-end py-2">+₹{selectedBooking.additionalCharges}</td>
                      </tr>
                    )}
                    {selectedBooking.discount > 0 && (
                      <tr className="pricing-table-row border-bottom py-1 fs-8 text-success fw-semibold">
                        <td className="py-2">Coupon discount ({selectedBooking.couponCode})</td>
                        <td className="text-end py-2">-₹{selectedBooking.discount}</td>
                      </tr>
                    )}
                    <tr className="invoice-total-row pt-3 fs-6 fw-bold">
                      <td className="pt-3 text-slate-800">Grand Total Paid</td>
                      <td className="text-end pt-3 text-primary fs-5">₹{selectedBooking.finalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center text-muted fw-bold tracking-wider fs-9 uppercase mb-0 mt-3 pt-3 border-top border-dashed">Thank you for using ParkEasy LLC</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 no-print gap-2">
          <Button variant="outline-secondary" onClick={() => setSelectedBooking(null)} className="flex-fill border-0 py-2" style={{ fontSize: '12px' }}>Dismiss</Button>
          <Button variant="primary" onClick={handlePrintInvoice} className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2" style={{ fontSize: '12px', border: 0 }}><Printer size={14} /> Print Receipt</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
