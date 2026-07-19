import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Modal, Badge } from 'react-bootstrap';
import { CalendarPlus, User, Car as CarIcon, Phone, SquareTerminal, Calculator } from 'lucide-react';
import { useParking } from '../context/ParkingContext.jsx';
import { parkingRates, additionalServices } from '../data/feeConfig.js';
import bikeImg from '../assets/images/bike_parking_1781875871337.jpg';
import carImg from '../assets/images/car_parking_1781875889280.jpg';
import suvImg from '../assets/images/suv_parking_1781875904725.jpg';
import evImg from '../assets/images/ev_parking_1781875922312.jpg';

const backgroundImages = {
  Bike: bikeImg,
  Car: carImg,
  SUV: suvImg,
  ElectricVehicle: evImg,
};

export const BookParking = () => {
  const { slots, bookSlot, showToast, vehicleType, setVehicleType } = useParking();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [exitTime, setExitTime] = useState('');

  const [carWash, setCarWash] = useState(false);
  const [evCharging, setEvCharging] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  const availableSlots = slots.filter((slot) => slot.status === 'Available');
  const todayString = new Date().toISOString().split('T')[0];

  const calculateDuration = (d1, t1, d2, t2) => {
    if (!d1 || !t1 || !d2 || !t2) return 0;
    const diff = new Date(`${d2}T${t2}`) - new Date(`${d1}T${t1}`);
    return diff > 0 ? Math.ceil(diff / 3600000) : 0;
  };

  const finalDuration = calculateDuration(bookingDate, entryTime, exitDate, exitTime);
  const currentHourlyRate = parkingRates[vehicleType] || 20;
  const parkingFee = finalDuration * currentHourlyRate;
  const addCharges = (carWash ? parkingRates.carWash || 50 : 0);

  const discount = 0;

  const finalAmount = Math.max(0, parkingFee + addCharges - discount);

  const validateForm = () => {
    const err = {};
    if (!customerName || customerName.trim().length < 3) err.customerName = 'Customer Name must be at least 3 characters.';
    if (!/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(vehicleNumber)) err.vehicleNumber = 'Must match format (e.g. TN30AB1234 or KA01CD5678).';
    if (mobileNumber.length !== 10) err.mobileNumber = 'Mobile number must be exactly 10 digits.';
    if (!slotNumber) err.slotNumber = 'Please specify a parking spot.';
    if (!bookingDate || bookingDate < todayString) err.bookingDate = 'Dates in the past are invalid.';
    if (!entryTime) err.entryTime = 'Arrival Time is required.';
    if (!exitDate || exitDate < bookingDate) err.exitDate = 'Exit Date must be greater than or equal to Entry Date.';
    if (!exitTime) {
      err.exitTime = 'Exit Time is required.';
    } else if (bookingDate === exitDate && exitTime <= entryTime) {
      err.exitTime = 'Exit Time must be greater than Entry Time.';
    } else if (finalDuration <= 0) {
      err.exitTime = 'Exit schedule must be strictly after entry schedule.';
    } else {
      const diffMs = new Date(`${exitDate}T${exitTime}`) - new Date(`${bookingDate}T${entryTime}`);
      if (diffMs < 3600000) {
        err.exitTime = 'Minimum booking duration is 1 hour.';
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleInitiateSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Validation failed. Please review your entries.', 'error');
      return;
    }
    setShowReviewModal(true);
  };

  const handleFinalConfirmBooking = () => {
    setShowReviewModal(false);
    setIsSubmitting(true);
    setTimeout(() => {
      bookSlot({
        customerName: customerName.trim(), vehicleNumber, mobileNumber, slotNumber,
        bookingDate, entryTime, exitDate, exitTime, vehicleType, duration: finalDuration,
        parkingFee, additionalCharges: addCharges, discount, finalAmount,
        carWash, evCharging, premiumParking: false, couponCode: undefined
      });
      setCustomerName(''); setVehicleNumber(''); setMobileNumber(''); setSlotNumber('');
      setBookingDate(''); setEntryTime(''); setExitDate(''); setExitTime('');
      setVehicleType('Car'); setCarWash(false); setEvCharging(false);
      setErrors({}); setIsSubmitting(false);
    }, 1100);
  };

  return (
    <Container fluid="lg" className="fade-in py-4">
      <div className="page-header mb-4 animate-slide-down">
        <h1 className="page-title">Book Parking Spot</h1>
      </div>

      <Row className="g-4">
        <Col lg={7} className="animate-fade-slide" style={{ animationDelay: '150ms' }}>
          <Card className="form-card border-0 shadow-sm p-4 h-100">
            <Card.Body className="p-0">
              <div className="form-card-title-area d-flex align-items-center gap-3 mb-4">
                <div className="form-card-icon d-flex align-items-center justify-content-center">
                  <CalendarPlus size={20} />
                </div>
                <div>
                  <Card.Title as="h2" className="form-card-title m-0">Reservation Console</Card.Title>
                </div>
              </div>

              <Form onSubmit={handleInitiateSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label fw-semibold text-slate-700">Vehicle Category</Form.Label>
                  <div className="segmented-control d-flex gap-1 bg-light p-1 rounded">
                    {['Bike', 'Car', 'SUV', 'ElectricVehicle'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`segmented-button flex-fill py-2 border-0 rounded text-center ${vehicleType === type ? 'active bg-white shadow-sm fw-bold' : 'bg-transparent text-secondary'}`}
                        onClick={() => {
                          setVehicleType(type);
                          if (type !== 'ElectricVehicle') {
                            setEvCharging(false);
                          }
                          setErrors((prev) => ({ ...prev, vehicleNumber: '' }));
                        }}
                        style={{ fontSize: '12px', transition: 'all 0.2s' }}
                      >
                        {type === 'ElectricVehicle' ? 'Electric (EV)' : type}
                      </button>
                    ))}
                  </div>
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label htmlFor="customer-name-input" className="form-label fw-semibold text-slate-700">Customer Name</Form.Label>
                      <div className="form-input-container position-relative">
                        <User size={16} className="form-input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ zIndex: 1 }} />
                        <Form.Control
                          id="customer-name-input"
                          type="text"
                          placeholder="e.g. John Doe"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          disabled={isSubmitting}
                          className="ps-5"
                          style={{ borderRadius: '8px' }}
                        />
                      </div>
                      {errors.customerName && (
                        <Form.Text id="customer-name-error" className="text-danger fw-semibold d-block mt-1" style={{ fontSize: '11px' }}>
                          {errors.customerName}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label htmlFor="vehicle-number-input" className="form-label fw-semibold text-slate-700">Vehicle Registration Number</Form.Label>
                      <div className="form-input-container position-relative">
                        <CarIcon size={16} className="form-input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ zIndex: 1 }} />
                        <Form.Control
                          id="vehicle-number-input"
                          type="text"
                          placeholder="e.g. TN30AB1234"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                          disabled={isSubmitting}
                          className="ps-5 font-monospace"
                          style={{ textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '8px' }}
                        />
                      </div>
                      {errors.vehicleNumber ? (
                        <Form.Text id="vehicle-number-error" className="text-danger fw-semibold d-block mt-1" style={{ fontSize: '11px' }}>
                          {errors.vehicleNumber}
                        </Form.Text>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>Format: TN12AB1234 / KA01CD5678</span>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label htmlFor="mobile-number-input" className="form-label fw-semibold text-slate-700">Mobile Number</Form.Label>
                      <div className="form-input-container position-relative">
                        <Phone size={16} className="form-input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ zIndex: 1 }} />
                        <Form.Control
                          id="mobile-number-input"
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          disabled={isSubmitting}
                          className="ps-5"
                          style={{ borderRadius: '8px' }}
                        />
                      </div>
                      {errors.mobileNumber ? (
                        <Form.Text id="mobile-number-error" className="text-danger fw-semibold d-block mt-1" style={{ fontSize: '11px' }}>
                          {errors.mobileNumber}
                        </Form.Text>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>10-digit number for SMS dispatch.</span>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label htmlFor="slot-selection-dropdown" className="form-label fw-semibold text-slate-700">Select Parking Slot</Form.Label>
                      <div className="form-input-container position-relative">
                        <SquareTerminal size={16} className="form-input-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" style={{ zIndex: 1 }} />
                        <Form.Select
                          id="slot-selection-dropdown"
                          value={slotNumber}
                          onChange={(e) => setSlotNumber(e.target.value)}
                          disabled={isSubmitting || availableSlots.length === 0}
                          className="ps-5"
                          style={{ appearance: 'auto', borderRadius: '8px' }}
                        >
                          <option value="">-- Choose Vacant Slot Bay --</option>
                          {availableSlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>Slot {slot.id}</option>
                          ))}
                        </Form.Select>
                      </div>
                      {errors.slotNumber ? (
                        <Form.Text id="slot-error-msg" className="text-danger fw-semibold d-block mt-1" style={{ fontSize: '11px' }}>
                          {errors.slotNumber}
                        </Form.Text>
                      ) : availableSlots.length === 0 ? (
                        <Form.Text id="slots-full-warning" className="text-danger fw-bold d-block mt-1" style={{ fontSize: '11px' }}>All slots are fully booked!</Form.Text>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--success-text)', marginTop: '4px', display: 'block', fontWeight: '600' }}>{availableSlots.length} vacant spots remaining.</span>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="border-top pt-4 mb-4">
                  <span className="form-label d-block mb-3 fw-bold text-slate-800" style={{ fontSize: '13px' }}>Arrival & Departure Timestamps</span>
                  <div className="p-3 bg-light rounded" style={{ border: '1px solid #e2e8f0' }}>
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="pb-2 mb-2 border-bottom fw-bold text-primary fs-9 uppercase">1. Check-In Arrival</div>
                        <Form.Group className="mb-2">
                          <label htmlFor="booking-date-input" className="form-label fs-9 fw-semibold text-slate-600 mb-1 d-block">Entry Date</label>
                          <Form.Control
                            id="booking-date-input"
                            type="date"
                            min={todayString}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                          />
                          {errors.bookingDate && <p className="text-danger fs-9 mb-0 mt-1">{errors.bookingDate}</p>}
                        </Form.Group>
                        <Form.Group>
                          <label htmlFor="entry-time-input" className="form-label fs-9 fw-semibold text-slate-600 mb-1 d-block">Arriving At</label>
                          <Form.Control
                            id="entry-time-input"
                            type="time"
                            value={entryTime}
                            onChange={(e) => setEntryTime(e.target.value)}
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                          />
                          {errors.entryTime && <p className="text-danger fs-9 mb-0 mt-1">{errors.entryTime}</p>}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <div className="pb-2 mb-2 border-bottom fw-bold text-danger fs-9 uppercase">2. Check-Out Departure</div>
                        <Form.Group className="mb-2">
                          <label htmlFor="exit-date-input" className="form-label fs-9 fw-semibold text-slate-600 mb-1 d-block">Exit Date</label>
                          <Form.Control
                            id="exit-date-input"
                            type="date"
                            min={bookingDate || todayString}
                            value={exitDate}
                            onChange={(e) => setExitDate(e.target.value)}
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                          />
                          {errors.exitDate && <p className="text-danger fs-9 mb-0 mt-1">{errors.exitDate}</p>}
                        </Form.Group>
                        <Form.Group>
                          <label htmlFor="exit-time-input" className="form-label fs-9 fw-semibold text-slate-600 mb-1 d-block">Departing At</label>
                          <Form.Control
                            id="exit-time-input"
                            type="time"
                            value={exitTime}
                            onChange={(e) => setExitTime(e.target.value)}
                            style={{ borderRadius: '6px', fontSize: '12px' }}
                          />
                          {errors.exitTime && <p className="text-danger fs-9 mb-0 mt-1">{errors.exitTime}</p>}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </div>

                <Button
                  id="submit-booking-btn"
                  type="submit"
                  disabled={availableSlots.length === 0 || isSubmitting}
                  className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                  style={{ borderRadius: '8px' }}
                >
                  <Calculator size={16} /> Review Booking & Rates
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5} className="animate-fade-slide" style={{ animationDelay: '300ms' }}>
          <Card className="sidebar-preview-card border-0 shadow-sm overflow-hidden h-100">
            <div className="sidebar-preview-img-container position-relative" style={{ height: '180px' }}>
              <Card.Img
                variant="top"
                src={backgroundImages[vehicleType]}
                alt={vehicleType}
                className="w-100 h-100 object-fit-cover"
                style={{ filter: 'brightness(0.7)' }}
              />
              <div className="sidebar-preview-img-overlay position-absolute bottom-0 start-0 p-3 text-white">
                <Badge bg="primary" className="mb-2 uppercase" style={{ fontSize: '10px' }}>Category: {vehicleType}</Badge>
                <h3 className="h5 m-0 fw-bold">
                  {vehicleType === 'Bike' ? 'Single-Space Bike Slot' :
                   vehicleType === 'Car' ? 'Standard Sedan/Hatch Slot' :
                   vehicleType === 'SUV' ? 'Deep SUV Slot' : 'Clean EV spot with Grid charging'}
                </h3>
              </div>
            </div>

            <Card.Body className="p-4">
              <h3 className="receipt-pane-title mb-3 fs-6 uppercase tracking-wider text-muted fw-bold">Realtime Recalculation</h3>
              <div className="table-responsive mb-4">
                <table className="pricing-table w-100">
                  <tbody>
                    <tr className="pricing-table-row border-bottom py-2">
                      <td className="pricing-table-cell-label text-secondary py-2 fs-7">Base Hourly rate</td>
                      <td className="pricing-table-cell-value fw-semibold text-end py-2 fs-7">₹{currentHourlyRate}/hr</td>
                    </tr>
                    <tr className="pricing-table-row border-bottom py-2">
                      <td className="pricing-table-cell-label text-secondary py-2 fs-7">Compiling Hours</td>
                      <td className="pricing-table-cell-value fw-semibold text-end py-2 fs-7">
                        {finalDuration > 0 ? `${finalDuration} Hours` : <span className="text-muted fst-italic">Provide Schedulers</span>}
                      </td>
                    </tr>
                    <tr className="pricing-table-row border-bottom py-2">
                      <td className="pricing-table-cell-label text-secondary py-2 fs-7">Base Fee</td>
                      <td className="pricing-table-cell-value fw-semibold text-end py-2 fs-7">₹{parkingFee}</td>
                    </tr>
                    <tr className="pricing-table-row border-bottom py-2">
                      <td className="pricing-table-cell-label text-secondary py-2 fs-7">Additional Premium</td>
                      <td className="pricing-table-cell-value fw-semibold text-end py-2 fs-7">₹{addCharges}</td>
                    </tr>
                    {discount > 0 && (
                      <tr className="pricing-table-row border-bottom py-2">
                        <td className="pricing-table-cell-label text-success py-2 fs-7 fw-bold">Promo Coupon code</td>
                        <td className="pricing-table-cell-value text-success fw-bold text-end py-2 fs-7">-₹{discount}</td>
                      </tr>
                    )}
                    <tr className="pricing-total-row py-3 fw-bold">
                      <td className="pricing-total-label fs-5 py-3 text-slate-800">Total Amount</td>
                      <td className="pricing-total-value fs-4 text-end py-3 text-primary">₹{finalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-light rounded border mb-4">
                <span className="form-label d-block mb-2 text-primary fw-bold" style={{ fontSize: '11px' }}>Opt-In Extras (Simulated)</span>
                <div className="d-flex flex-column gap-2">
                  <Form.Check 
                    type="checkbox" id="service-wash"
                    label="Complete Car wash (+₹50)" checked={carWash}
                    onChange={(e) => setCarWash(e.target.checked)} className="fs-7" style={{ cursor: 'pointer' }}
                  />
                  {vehicleType === 'ElectricVehicle' && (
                    <Form.Check 
                      type="checkbox" id="service-charging"
                      label="EV Power Charge" checked={evCharging}
                      onChange={(e) => setEvCharging(e.target.checked)} className="fs-7" style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} centered animation={true}>
        <Modal.Header className="border-0 pb-0" closeButton>
          <Modal.Title className="fs-6 text-uppercase text-muted fw-bold tracking-wider">Review Order Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0">
          <div className="invoice-body">
            <div className="invoice-letterhead text-center mb-4">
              <h2 className="invoice-letterhead-title h3 fw-bold font-display text-primary mb-1">ParkEasy Parking</h2>
              <p className="invoice-letterhead-subtitle text-muted fs-8 mb-0">Temporary Pre-allocation Review</p>
            </div>

            <Row className="g-3 mb-4 p-3 bg-light rounded" style={{ border: '1px solid #e2e8f0' }}>
              <Col xs={6}>
                <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Driver Name</span>
                <span className="invoice-ref-val fw-semibold text-slate-800 fs-7">{customerName}</span>
              </Col>
              <Col xs={6}>
                <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Registration</span>
                <span className="invoice-ref-val fw-bold text-danger fs-7 font-monospace">{vehicleNumber}</span>
              </Col>
              <Col xs={6}>
                <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Device SMS No</span>
                <span className="invoice-ref-val fw-semibold text-slate-800 fs-7">+91 {mobileNumber}</span>
              </Col>
              <Col xs={6}>
                <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Assigned slot</span>
                <span className="invoice-ref-val fw-semibold text-primary fs-7 font-monospace">Slot {slotNumber}</span>
              </Col>
              <Col xs={6}>
                <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Check-In</span>
                <span className="invoice-ref-val text-slate-800 fs-8 d-block">{bookingDate} ({entryTime})</span>
              </Col>
              <Col xs={6}>
                <span className="invoice-ref-label text-uppercase text-muted d-block fs-9 fw-bold">Check-Out</span>
                <span className="invoice-ref-val text-slate-800 fs-8 d-block">{exitDate} ({exitTime})</span>
              </Col>
            </Row>

            <div className="invoice-pricing-area mb-4">
              <div className="invoice-pricing-title fw-bold fs-7 col-12 mb-2">Summary list</div>
              <table className="pricing-table w-100">
                <tbody>
                  <tr className="pricing-table-row border-bottom py-1 fs-8 text-secondary">
                    <td className="py-1">Base hours rate ({vehicleType})</td>
                    <td className="text-end py-1">₹{currentHourlyRate}/hr</td>
                  </tr>
                  <tr className="pricing-table-row border-bottom py-1 fs-8 text-secondary">
                    <td className="py-1">Hours allocated</td>
                    <td className="text-end py-1">{finalDuration} Hours</td>
                  </tr>
                  <tr className="pricing-table-row border-bottom py-1 fs-8 text-secondary">
                    <td className="py-1">Additional services</td>
                    <td className="text-end py-1">₹{addCharges}</td>
                  </tr>
                  {discount > 0 && (
                    <tr className="pricing-table-row border-bottom py-1 fs-8 text-success fw-semibold">
                      <td className="py-1">Coupon savings</td>
                      <td className="text-end py-1">-₹{discount}</td>
                    </tr>
                  )}
                  <tr className="invoice-total-row pt-2 fs-6 fw-bold">
                    <td className="pt-2 text-slate-800">Final Amount</td>
                    <td className="text-end pt-2 text-primary fs-5">₹{finalAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-column gap-2">
              <Button id="confirm-booking-modal-btn" onClick={handleFinalConfirmBooking} className="btn btn-primary w-100 py-2 border-0 fw-bold" style={{ borderRadius: '6px' }}>Confirm & Dispatch slot</Button>
              <Button id="close-confirmation-modal-btn" variant="link" onClick={() => setShowReviewModal(false)} className="text-uppercase text-muted fw-bold fs-8 text-decoration-none py-2">Modify parameters</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};
