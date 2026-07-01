"""
Vihavi Database Seeder
======================
Populates the database with initial data matching the frontend db.json mock data.
Run with: python -m app.utils.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from app.database import SessionLocal, engine, Base
import app.models  # ensure all models are registered
from app.models.user import User
from app.models.event import Event
from app.models.ticket import Ticket
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.notification import Notification
from app.models.coupon import Coupon
from app.models.attendee import Attendee, Wishlist
from app.models.support_ticket import SupportTicket
from app.utils.security import hash_password


def seed():
    print("🌱 Dropping all existing tables for a clean seed...")
    Base.metadata.drop_all(bind=engine)
    print("🌱 Creating tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── Users ────────────────────────────────────────────────────────────
        if db.query(User).count() == 0:
            print("  → Seeding users...")
            users = [
                User(id="user-1", email="vihavi@gmail.com", hashed_password=hash_password("111"),
                     name="Vihavi", role="attendee", is_active=True, is_verified=True),
                User(id="mock-organizer-456", email="organizer@vihavi.dev", hashed_password=hash_password("password"),
                     name="Vihavi Event Management", role="organizer", is_active=True, is_verified=True,
                     phone="+91 98765 43210", location="Hyderabad, India",
                     about="We are a premier event management company specializing in tech conferences, open mics, and exclusive social gatherings across India.",
                     website="https://vihavi.dev", twitter="@vihavievents",
                     linkedin="linkedin.com/company/vihavi"),
                User(id="organizer-2", email="event@gmail.com", hashed_password=hash_password("123456"),
                     name="Event Manager", role="organizer", is_active=True, is_verified=True),
                User(id="admin-1", email="admin@vihavi.dev", hashed_password=hash_password("password"),
                     name="Platform Admin", role="admin", is_active=True, is_verified=True),
                User(id="attendee-vihavi-dev", email="attendee@vihavi.dev", hashed_password=hash_password("password"),
                     name="Vihavi Attendee", role="attendee", is_active=True, is_verified=True),
                User(id="attendee-john", email="john@example.com", hashed_password=hash_password("password"),
                     name="John Doe", role="attendee", is_active=True, is_verified=True,
                     phone="+91 99999 88888"),
                User(id="attendee-alice", email="alice@example.com", hashed_password=hash_password("password"),
                     name="Alice Smith", role="attendee", is_active=True, is_verified=True,
                     phone="+91 88888 77777"),
                User(id="attendee-bob", email="bob@example.com", hashed_password=hash_password("password"),
                     name="Bob Johnson", role="attendee", is_active=True, is_verified=True,
                     phone="+91 77777 66666"),
            ]
            db.add_all(users)
            db.flush()
            print(f"    ✓ {len(users)} users created")

        # ── Events ───────────────────────────────────────────────────────────
        if db.query(Event).count() == 0:
            print("  → Seeding events...")
            events = [
                Event(
                    id="1", name="Summer Music Festival 2026",
                    summary="Experience the ultimate summer music festival with top artists.",
                    description="Experience the ultimate summer music festival with top artists from around the world. Enjoy amazing food, great company, and unforgettable performances. Gates open at 4 PM.",
                    category="Music", tags="festival, summer, music", format="In-Person",
                    venue="Central Park Arena", address="Central Park Arena, NY",
                    city="New York", state="NY", country="USA",
                    maps_link="https://maps.google.com",
                    start_date="2026-08-15", end_date="2026-08-15",
                    start_time="18:00", end_time="23:00", time_zone="EST",
                    banner="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800&h=400",
                    terms="No refunds within 24 hours of event.",
                    refund_policy="Refundable up to 7 days before.",
                    instructions="Carry your ID card and QR ticket.",
                    what_to_bring="Good vibes and your ticket.",
                    faqs=[{"q": "Is there parking available?", "a": "Yes, free parking is available."}],
                    visibility="Public", status="Published",
                    booking_limit=5, cancellation_policy="Standard",
                    organizer_id="mock-organizer-456",
                    organizer_name="Vihavi Events Team",
                    organizer_email="organizer@vihavi.dev",
                    price=50.0, rating=4.8, featured=True,
                    enable_waitlist=True, agree_to_terms=True,
                    coupons=[]
                ),
                Event(
                    id="2", name="Tech Innovators Conference 2026",
                    summary="Join the brightest minds in tech for a two-day conference.",
                    description="Join the brightest minds in tech for a two-day conference exploring the future of AI, web development, and cloud computing.",
                    category="Technology", tags="tech, conference, AI", format="In-Person",
                    venue="Moscone Center", address="Moscone Center, SF",
                    city="San Francisco", state="CA", country="USA",
                    maps_link="https://maps.google.com",
                    start_date="2026-09-10", end_date="2026-09-11",
                    start_time="09:00", end_time="17:00", time_zone="PST",
                    banner="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=400",
                    terms="Strict security check.",
                    refund_policy="No refunds.",
                    instructions="Arrive 30 minutes early.",
                    what_to_bring="Laptop, Notebook.",
                    visibility="Public", status="Published",
                    booking_limit=2, cancellation_policy="No-Cancellation",
                    organizer_id="mock-organizer-456",
                    organizer_name="TechWorld",
                    organizer_email="organizer@vihavi.dev",
                    price=120.0, rating=4.9,
                    agree_to_terms=True,
                ),
                Event(
                    id="3", name="Food & Wine Expo",
                    summary="Indulge in a weekend of premium wine tasting.",
                    description="Indulge in a weekend of premium wine tasting, culinary workshops, and dishes created by world-renowned chefs.",
                    category="Food", tags="food, wine, expo", format="In-Person",
                    venue="Napa Valley Venue", address="Napa Valley, CA",
                    city="Napa Valley", state="CA", country="USA",
                    start_date="2026-10-05", end_date="2026-10-06",
                    start_time="11:00", end_time="18:00", time_zone="PST",
                    banner="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800&h=400",
                    terms="Must be 21+ to consume alcohol.",
                    refund_policy="Refundable up to 14 days before.",
                    instructions="Bring valid government ID.",
                    visibility="Public", status="Published",
                    booking_limit=4, cancellation_policy="Standard",
                    organizer_id="mock-organizer-456",
                    organizer_name="Culinary Union",
                    price=35.0, rating=4.7, agree_to_terms=True,
                ),
            ]
            db.add_all(events)
            db.flush()
            print(f"    ✓ {len(events)} events created")

        # ── Tickets ──────────────────────────────────────────────────────────
        if db.query(Ticket).count() == 0:
            print("  → Seeding tickets...")
            tickets = [
                Ticket(id="t1", event_id="1", name="Early Bird", price=50.0, quantity=100, sold=40,
                       sale_start="2026-06-01", sale_end="2026-07-01"),
                Ticket(id="t2", event_id="1", name="General Admission", price=75.0, quantity=200, sold=120,
                       sale_start="2026-07-01", sale_end="2026-08-14"),
                Ticket(id="t3", event_id="1", name="VIP Pass", price=150.0, quantity=50, sold=15,
                       sale_start="2026-06-01", sale_end="2026-08-14",
                       desc="Front row access, free drinks, and VIP lounge."),
                Ticket(id="t4", event_id="2", name="Standard Pass", price=120.0, quantity=300, sold=85,
                       sale_start="2026-06-01", sale_end="2026-09-09"),
                Ticket(id="t5", event_id="2", name="All-Access Pass", price=300.0, quantity=50, sold=5,
                       sale_start="2026-06-01", sale_end="2026-09-09",
                       desc="Includes workshops and exclusive networking dinner."),
                Ticket(id="t6", event_id="3", name="Standard Access", price=35.0, quantity=200, sold=80,
                       sale_start="2026-07-01", sale_end="2026-10-04"),
                Ticket(id="t7", event_id="3", name="Vintner Pass", price=95.0, quantity=50, sold=12,
                       sale_start="2026-07-01", sale_end="2026-10-04",
                       desc="Includes exclusive reserve tastings and chef meet-and-greet."),
            ]
            db.add_all(tickets)
            db.flush()
            print(f"    ✓ {len(tickets)} tickets created")

        # ── Bookings ─────────────────────────────────────────────────────────
        if db.query(Booking).count() == 0:
            print("  → Seeding bookings...")
            from datetime import datetime, timezone
            bookings = [
                Booking(id="101", event_id="2", ticket_id="t4", user_id="attendee-john",
                        user_name="John Doe", user_email="john@example.com", user_phone="+91 99999 88888",
                        ticket_name="Standard Pass", ticket_price=120.0, event_name="Tech Innovators Conference 2026",
                        quantity=2, total_paid=240.0, status="Confirmed",
                        check_in_status="Checked In",
                        checked_in_at=datetime(2026, 6, 25, 9, 58, 40, tzinfo=timezone.utc)),
                Booking(id="102", event_id="1", ticket_id="t2", user_id="attendee-alice",
                        user_name="Alice Smith", user_email="alice@example.com", user_phone="+91 88888 77777",
                        ticket_name="General Admission", ticket_price=75.0, event_name="Summer Music Festival 2026",
                        quantity=4, total_paid=300.0, status="Confirmed", check_in_status="Pending"),
                Booking(id="103", event_id="1", ticket_id="t3", user_id="attendee-bob",
                        user_name="Bob Johnson", user_email="bob@example.com", user_phone="+91 77777 66666",
                        ticket_name="VIP Pass", ticket_price=150.0, event_name="Summer Music Festival 2026",
                        quantity=1, total_paid=150.0, status="Pending", check_in_status="Pending"),
            ]
            db.add_all(bookings)
            db.flush()
            print(f"    ✓ {len(bookings)} bookings created")

        # ── Payments ─────────────────────────────────────────────────────────
        if db.query(Payment).count() == 0:
            print("  → Seeding payments...")
            payments = [
                Payment(id="p101", booking_id="101", amount=240.0, method="Razorpay", status="Success"),
                Payment(id="p102", booking_id="102", amount=300.0, method="Razorpay", status="Success"),
                Payment(id="p103", booking_id="103", amount=150.0, method="Razorpay", status="Pending"),
            ]
            db.add_all(payments)
            db.flush()
            print(f"    ✓ {len(payments)} payments created")

        # ── Coupons ──────────────────────────────────────────────────────────
        if db.query(Coupon).count() == 0:
            print("  → Seeding coupons...")
            coupons = [
                Coupon(id="c1", event_id="1", code="SUMMER50", discount_type="Percentage",
                       value=50.0, expiry="2026-08-01", active=True),
                Coupon(id="c2", event_id="2", code="TECH10", discount_type="Fixed Amount",
                       value=10.0, expiry="2026-09-01", active=True),
            ]
            db.add_all(coupons)
            db.flush()
            print(f"    ✓ {len(coupons)} coupons created")

        # ── Attendees ────────────────────────────────────────────────────────
        if db.query(Attendee).count() == 0:
            print("  → Seeding attendees...")
            from datetime import datetime, timezone
            attendees = [
                Attendee(id="a1", booking_id="101", event_id="2",
                         name="John Doe", email="john@example.com", phone="+91 99999 88888",
                         company="TechCorp", checked_in=True,
                         checked_in_at=datetime(2026, 6, 25, 9, 58, 40, tzinfo=timezone.utc),
                         qr_code="QR-101"),
                Attendee(id="a2", booking_id="102", event_id="1",
                         name="Alice Smith", email="alice@example.com", phone="+91 88888 77777",
                         company="Music Fan", checked_in=False, qr_code="QR-102"),
                Attendee(id="a3", booking_id="103", event_id="1",
                         name="Bob Johnson", email="bob@example.com", phone="+91 77777 66666",
                         company="", checked_in=False, qr_code="QR-103"),
            ]
            db.add_all(attendees)
            db.flush()
            print(f"    ✓ {len(attendees)} attendees created")

        # ── Notifications ────────────────────────────────────────────────────
        if db.query(Notification).count() == 0:
            print("  → Seeding notifications...")
            from datetime import datetime, timezone
            notifications = [
                Notification(id="n1", user_id="mock-organizer-456", type="booking",
                             message="New booking for Summer Music Festival by Alice Smith (4 tickets)",
                             read=False,
                             timestamp=datetime(2026, 6, 21, 14, 32, 0, tzinfo=timezone.utc)),
                Notification(id="n2", user_id="mock-organizer-456", type="payment",
                             message="Payment of ₹150 pending from Bob Johnson",
                             read=False,
                             timestamp=datetime(2026, 6, 22, 9, 15, 0, tzinfo=timezone.utc)),
            ]
            db.add_all(notifications)
            db.flush()
            print(f"    ✓ {len(notifications)} notifications created")

        # ── Support Tickets ──────────────────────────────────────────────────
        if db.query(SupportTicket).count() == 0:
            print("  → Seeding support tickets...")
            from datetime import datetime, timezone
            support_tickets = [
                SupportTicket(id="st1", user_id="user-1", subject="Ticket not received after payment",
                              category="Payment", status="Open", priority="High",
                              created_at=datetime(2026, 6, 24, 10, 0, 0, tzinfo=timezone.utc)),
                SupportTicket(id="st2", user_id="attendee-alice", subject="Unable to login after email verification",
                              category="Auth", status="Open", priority="Medium",
                              created_at=datetime(2026, 6, 24, 9, 30, 0, tzinfo=timezone.utc)),
                SupportTicket(id="st3", user_id="attendee-bob", subject="Refund not processed after 7 days",
                              category="Refund", status="In Progress", priority="High",
                              created_at=datetime(2026, 6, 23, 15, 0, 0, tzinfo=timezone.utc)),
                SupportTicket(id="st4", user_id="user-1", subject="Event page showing wrong date",
                              category="Content", status="Closed", priority="Low",
                              created_at=datetime(2026, 6, 22, 12, 0, 0, tzinfo=timezone.utc)),
                SupportTicket(id="st5", user_id="attendee-john", subject="QR code not scanning at venue",
                              category="Tickets", status="Open", priority="Critical",
                              created_at=datetime(2026, 6, 25, 8, 0, 0, tzinfo=timezone.utc)),
            ]
            db.add_all(support_tickets)
            db.flush()
            print(f"    ✓ {len(support_tickets)} support tickets created")

        db.commit()
        print("\n✅ Seed completed successfully!")
        print("\n📋 Login Credentials:")
        print("   Admin:     admin@vihavi.dev / password")
        print("   Organizer: organizer@vihavi.dev / password")
        print("   Organizer: event@gmail.com / 123456")
        print("   Attendee:  attendee@vihavi.dev / password")
        print("   Attendee:  vihavi@gmail.com / 111")
        print("   Attendee:  john@example.com / password")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
