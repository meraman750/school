from datetime import date, timedelta, datetime, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.academics.models import AcademicYear, Term, Department, Subject, SchoolClass, Section, Room
from apps.students.models import Student, Guardian, MedicalInfo
from apps.teachers.models import Teacher, TeacherQualification
from apps.website.models import SchoolInfo, BlogPost, Event, FAQ
from apps.settings_app.models import SchoolProfile, AcademicSettings, GradingSettings
from apps.library.models import BookCategory, Book

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo data for Biruk Academy Primary School'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Biruk Academy demo data...')

        admin_user, created = User.objects.get_or_create(
            email='admin@birukacademy.edu',
            defaults={
                'username': 'admin',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': User.Role.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            },
        )
        if created:
            admin_user.set_password('Admin@123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@birukacademy.edu / Admin@123'))
        else:
            self.stdout.write('Admin user already exists.')

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

        teacher_user, _ = User.objects.get_or_create(
            email='teacher@birukacademy.edu',
            defaults={
                'username': 'teacher1',
                'first_name': 'Abebe',
                'last_name': 'Kebede',
                'role': User.Role.TEACHER,
                'is_verified': True,
            },
        )
        if _:
            teacher_user.set_password('Teacher@123')
            teacher_user.save()

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

        if school_class.class_teacher is None:
            school_class.class_teacher = teacher
            school_class.save()

        TeacherQualification.objects.get_or_create(
            teacher=teacher,
            degree='B.Ed',
            defaults={
                'institution': 'Addis Ababa University',
                'field_of_study': 'Mathematics Education',
                'graduation_year': 2010,
            },
        )

        students_data = [
            ('STU001', 'Biruk', 'Tadesse', 'M', date(2014, 5, 10)),
            ('STU002', 'Hanna', 'Mekonnen', 'F', date(2014, 8, 22)),
            ('STU003', 'Dawit', 'Alemu', 'M', date(2014, 1, 30)),
            ('STU004', 'Sara', 'Hailu', 'F', date(2014, 11, 5)),
            ('STU005', 'Yonas', 'Bekele', 'M', date(2014, 7, 18)),
        ]

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
                },
            )
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
