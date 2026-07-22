"""Ethiopian calendar academic year helpers (English labels)."""
from datetime import date


# Ethiopian calendar years 2010 E.C. – 2019 E.C. with approximate Gregorian boundaries.
ETHIOPIAN_ACADEMIC_YEARS = [
    (2010, date(2017, 9, 11), date(2018, 9, 10)),
    (2011, date(2018, 9, 11), date(2019, 9, 10)),
    (2012, date(2019, 9, 11), date(2020, 9, 10)),
    (2013, date(2020, 9, 11), date(2021, 9, 10)),
    (2014, date(2021, 9, 11), date(2022, 9, 10)),
    (2015, date(2022, 9, 11), date(2023, 9, 10)),
    (2016, date(2023, 9, 11), date(2024, 9, 10)),
    (2017, date(2024, 9, 11), date(2025, 9, 10)),
    (2018, date(2025, 9, 11), date(2026, 9, 10)),
    (2019, date(2026, 9, 11), date(2027, 9, 10)),
]


def ethiopian_year_label(ec_year: int) -> str:
    return f'{ec_year} E.C.'


def seed_ethiopian_academic_years(AcademicYear):
    """Create or update Ethiopian calendar academic years 2010–2019 E.C."""
    current_ec = 2018
    created = []
    for ec_year, start, end in ETHIOPIAN_ACADEMIC_YEARS:
        name = ethiopian_year_label(ec_year)
        year, was_created = AcademicYear.objects.update_or_create(
            name=name,
            defaults={
                'start_date': start,
                'end_date': end,
                'is_current': ec_year == current_ec,
            },
        )
        created.append((year, was_created))
    AcademicYear.objects.exclude(
        name__in=[ethiopian_year_label(ec) for ec, _, _ in ETHIOPIAN_ACADEMIC_YEARS],
    ).update(is_current=False)
    return created
