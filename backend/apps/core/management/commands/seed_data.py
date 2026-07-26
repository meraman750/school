from datetime import date, timedelta, datetime, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.academics.models import AcademicYear, Term, Department, Subject, SchoolClass, Section, Room
from apps.students.models import Student, Guardian, MedicalInfo
from apps.teachers.models import Teacher, TeacherQualification, TeacherSalaryInfo, TeacherSalaryPayment
from apps.website.models import SchoolInfo, BlogPost, Event, FAQ
from apps.settings_app.models import SchoolProfile, AcademicSettings, GradingSettings
from apps.library.models import BookCategory, Book
from apps.finance.models import FeeStructure, Invoice, Payment

User = get_user_model()

DEMO_PASSWORDS = {
    'admin@birukacademy.edu': 'Admin@123',
    'teacher@birukacademy.edu': 'Teacher@123',
    'student@birukacademy.edu': 'Student@123',
    'finance@birukacademy.edu': 'Finance@123',
}


class Command(BaseCommand):
    help = 'Seed demo data for Biruk Academy Primary School'

    def _upsert_demo_user(self, email, password, **defaults):
        username = defaults.pop('username', email.split('@')[0])
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'username': username, **defaults},
        )
        for key, value in defaults.items():
            setattr(user, key, value)
        user.set_password(password)
        user.save()
        action = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(f'{action} demo user: {email} / {password}'))
        return user

    def handle(self, *args, **options):
        self.stdout.write('Seeding Biruk Academy demo data...')

        admin_user = self._upsert_demo_user(
            'admin@birukacademy.edu',
            DEMO_PASSWORDS['admin@birukacademy.edu'],
            username='admin',
            first_name='System',
            last_name='Administrator',
            role=User.Role.SUPER_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_verified=True,
        )

        academic_year, _ = AcademicYear.objects.get_or_create(
            name='2018 E.C.',
            defaults={
                'start_date': date(2025, 9, 11),
                'end_date': date(2026, 9, 10),
                'is_current': True,
            },
        )

        from apps.academics.ethiopian_calendar import seed_ethiopian_academic_years
        seed_ethiopian_academic_years(AcademicYear)
        academic_year = AcademicYear.objects.filter(is_current=True).first() or academic_year

        Term.objects.get_or_create(
            academic_year=academic_year,
            name='Term 1',
            defaults={
                'start_date': date(2025, 9, 1),
                'end_date': date(2025, 12, 20),
                'is_current': True,
            },
        )

        dept, _ = Department.objects.get_or_create(
            code='GEN',
            defaults={'name': 'General Education', 'description': 'Primary school general education'},
        )

        subjects_data = [
            ('MATH', 'Mathematics'),
            ('ENG', 'English'),
            ('AMH', 'Amharic'),
            ('SCI', 'Science'),
            ('SOC', 'Social Studies'),
        ]
        subjects = []
        for code, name in subjects_data:
            subj, _ = Subject.objects.get_or_create(
                code=code,
                defaults={'name': name, 'department': dept, 'credit_hours': 1},
            )
            subjects.append(subj)

        school_class, _ = SchoolClass.objects.get_or_create(
            name='Grade 5A',
            academic_year=academic_year,
            defaults={'grade_level': 5, 'capacity': 35, 'room': 'Room 101'},
        )

        Section.objects.get_or_create(
            school_class=school_class,
            name='A',
            defaults={'capacity': 35},
        )

        Room.objects.get_or_create(
            name='Room 101',
            defaults={'building': 'Main Block', 'floor': '1', 'capacity': 40, 'room_type': 'Classroom'},
        )

        teacher_user = self._upsert_demo_user(
            'teacher@birukacademy.edu',
            DEMO_PASSWORDS['teacher@birukacademy.edu'],
            username='teacher1',
            first_name='Abebe',
            last_name='Kebede',
            role=User.Role.TEACHER,
            is_verified=True,
        )

        teacher, _ = Teacher.objects.get_or_create(
            employee_id='TCH001',
            defaults={
                'user': teacher_user,
                'first_name': 'Abebe',
                'last_name': 'Kebede',
                'gender': 'M',
                'date_of_birth': date(1985, 3, 15),
                'email': 'teacher@birukacademy.edu',
                'phone': '+251911000001',
                'hire_date': date(2018, 9, 1),
                'specialization': 'Mathematics',
                'years_of_experience': 7,
            },
        )
        if teacher.user_id != teacher_user.id:
            teacher.user = teacher_user
            teacher.save(update_fields=['user'])

        TeacherQualification.objects.get_or_create(
            teacher=teacher,
            degree='B.Ed',
            defaults={
                'institution': 'Addis Ababa University',
                'field_of_study': 'Mathematics Education',
                'graduation_year': 2010,
            },
        )

        TeacherSalaryInfo.objects.get_or_create(
            teacher=teacher,
            defaults={
                'base_salary': 15000,
                'housing_allowance': 3000,
                'transport_allowance': 1500,
                'tax_deduction': 1200,
                'pension_deduction': 750,
                'bank_name': 'Commercial Bank of Ethiopia',
                'bank_account': '1000123456789',
                'effective_from': date(2018, 9, 1),
            },
        )

        students_data = [
            ('STU001', 'Biruk', 'Tadesse', 'M', date(2014, 5, 10)),
            ('STU002', 'Hanna', 'Mekonnen', 'F', date(2014, 8, 22)),
            ('STU003', 'Dawit', 'Alemu', 'M', date(2014, 1, 30)),
            ('STU004', 'Sara', 'Hailu', 'F', date(2014, 11, 5)),
            ('STU005', 'Yonas', 'Bekele', 'M', date(2014, 7, 18)),
        ]

        demo_student = None
        for adm_num, first, last, gender, dob in students_data:
            student, created = Student.objects.get_or_create(
                admission_number=adm_num,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'gender': gender,
                    'date_of_birth': dob,
                    'enrollment_date': date(2025, 9, 1),
                    'status': Student.Status.ACTIVE,
                    'email': f'{first.lower()}@student.birukacademy.edu',
                    'city': 'Addis Ababa',
                    'region': 'Addis Ababa',
                    'grade_level': 5,
                    'section': 'A',
                },
            )
            if not created and (student.grade_level != 5 or student.section != 'A'):
                student.grade_level = 5
                student.section = 'A'
                student.save(update_fields=['grade_level', 'section'])
            if adm_num == 'STU001':
                demo_student = student
            if created:
                Guardian.objects.get_or_create(
                    student=student,
                    first_name=f'{first} Sr.',
                    last_name=last,
                    defaults={
                        'relationship': Guardian.Relationship.FATHER,
                        'phone': f'+251911{adm_num[-3:]}000',
                        'is_primary': True,
                    },
                )
                MedicalInfo.objects.get_or_create(
                    student=student,
                    defaults={'allergies': 'None'},
                )

        if demo_student:
            student_user = self._upsert_demo_user(
                'student@birukacademy.edu',
                DEMO_PASSWORDS['student@birukacademy.edu'],
                username='student1',
                first_name=demo_student.first_name,
                last_name=demo_student.last_name,
                role=User.Role.STUDENT,
                is_verified=True,
            )
            if demo_student.user_id != student_user.id:
                demo_student.user = student_user
                demo_student.save(update_fields=['user'])

        User.objects.filter(email='parent@birukacademy.edu').delete()

        self._upsert_demo_user(
            'finance@birukacademy.edu',
            DEMO_PASSWORDS['finance@birukacademy.edu'],
            username='finance1',
            first_name='Meron',
            last_name='Assefa',
            role=User.Role.FINANCE,
            is_verified=True,
        )

        fee_structure, _ = FeeStructure.objects.get_or_create(
            name='Grade 5 Monthly Tuition',
            academic_year=academic_year,
            school_class=school_class,
            defaults={
                'tuition_fee': 2500,
                'registration_fee': 500,
                'is_active': True,
            },
        )

        year = timezone.now().year
        for idx, student in enumerate(Student.objects.filter(admission_number__in=[s[0] for s in students_data])):
            for month in range(1, 8):
                inv_num = f'INV-{student.admission_number}-{year}-{month:02d}'
                paid = month <= 6 or idx % 2 == 0
                status = Invoice.Status.PAID if paid else Invoice.Status.PENDING
                issue = date(year, month, 5)
                invoice, _ = Invoice.objects.get_or_create(
                    invoice_number=inv_num,
                    defaults={
                        'student': student,
                        'fee_structure': fee_structure,
                        'issue_date': issue,
                        'due_date': issue + timedelta(days=14),
                        'total_amount': 2500,
                        'amount_paid': 2500 if paid else 0,
                        'status': status,
                    },
                )
                if paid and not invoice.payments.filter(status=Payment.Status.COMPLETED).exists():
                    Payment.objects.get_or_create(
                        payment_reference=f'PAY-{inv_num}',
                        defaults={
                            'invoice': invoice,
                            'amount': 2500,
                            'payment_method': Payment.Method.CASH,
                            'payment_date': timezone.make_aware(datetime.combine(issue, time.min)),
                            'status': Payment.Status.COMPLETED,
                        },
                    )

        for month in range(1, 7):
            period_start = date(year, month, 1)
            if month == 12:
                period_end = date(year, 12, 31)
            else:
                period_end = date(year, month + 1, 1) - timedelta(days=1)
            TeacherSalaryPayment.objects.get_or_create(
                teacher=teacher,
                pay_period_start=period_start,
                defaults={
                    'pay_period_end': period_end,
                    'basic_salary': 15000,
                    'allowances': 4500,
                    'deductions': 1950,
                    'net_salary': 17550,
                    'status': TeacherSalaryPayment.Status.PAID,
                    'payment_date': period_start,
                },
            )

        SchoolInfo.objects.get_or_create(
            name='Biruk Academy Primary School',
            defaults={
                'motto': 'Excellence Through Education',
                'mission': 'To provide quality primary education that nurtures intellectual curiosity and moral integrity.',
                'vision': 'To be a leading primary school in Ethiopia.',
                'about': 'Biruk Academy Primary School has been serving the community since 2010.',
                'address': 'Bole Sub City, Addis Ababa, Ethiopia',
                'phone': '+251911000000',
                'email': 'info@birukacademy.edu',
                'website': 'https://birukacademy.edu',
                'established_year': 2010,
            },
        )

        SchoolProfile.objects.get_or_create(
            school_code='BAPS',
            defaults={
                'school_name': 'Biruk Academy Primary School',
                'address': 'Bole Sub City, Addis Ababa, Ethiopia',
                'phone': '+251911000000',
                'email': 'info@birukacademy.edu',
                'principal_name': 'Dr. Selamawit Gebre',
                'established_year': 2010,
            },
        )

        AcademicSettings.objects.get_or_create(
            current_academic_year='2025/2026',
            defaults={
                'current_term': 'Term 1',
                'grading_system': 'LETTER',
                'passing_grade': 40,
                'max_absences_allowed': 25,
            },
        )

        grades = [
            ('A', 90, 100, 4.0, True),
            ('B', 80, 89, 3.0, True),
            ('C', 70, 79, 2.0, True),
            ('D', 60, 69, 1.0, True),
            ('F', 0, 59, 0.0, False),
        ]
        for letter, min_s, max_s, gp, passing in grades:
            GradingSettings.objects.get_or_create(
                grade_letter=letter,
                defaults={
                    'min_score': min_s,
                    'max_score': max_s,
                    'grade_point': gp,
                    'is_passing': passing,
                },
            )

        cat, _ = BookCategory.objects.get_or_create(name='Children Literature')
        Book.objects.get_or_create(
            isbn='9780141321066',
            defaults={
                'title': 'Matilda',
                'author': 'Roald Dahl',
                'category': cat,
                'total_copies': 5,
                'available_copies': 5,
            },
        )

        BlogPost.objects.get_or_create(
            slug='welcome-new-academic-year',
            defaults={
                'title': 'Welcome to the New Academic Year 2025/2026',
                'content': 'We warmly welcome all students and parents to the new academic year.',
                'excerpt': 'Welcome message for the new academic year.',
                'author_name': 'Principal',
                'is_published': True,
                'published_at': timezone.make_aware(datetime.combine(date.today(), time.min)),
            },
        )

        Event.objects.get_or_create(
            title='Annual Sports Day',
            defaults={
                'description': 'Join us for our annual sports day celebration.',
                'location': 'School Grounds',
                'start_date': timezone.make_aware(datetime.combine(date.today() + timedelta(days=30), time(hour=9))),
                'is_published': True,
            },
        )

        FAQ.objects.get_or_create(
            question='What are the school hours?',
            defaults={
                'answer': 'School hours are from 8:00 AM to 3:30 PM, Monday through Friday.',
                'category': 'General',
                'is_published': True,
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully!'))
        self.stdout.write('')
        self.stdout.write('Demo login accounts (passwords reset on each seed run):')
        for email, password in DEMO_PASSWORDS.items():
            self.stdout.write(f'  - {email} / {password}')
