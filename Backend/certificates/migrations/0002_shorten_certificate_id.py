from django.db import migrations, models
import secrets


def _generate_short_id(existing_ids):
    while True:
        candidate = f"BS-{secrets.token_hex(4).upper()}"
        if candidate not in existing_ids:
            existing_ids.add(candidate)
            return candidate


def populate_short_certificate_ids(apps, schema_editor):
    Certificate = apps.get_model("certificates", "Certificate")
    existing_ids = set(
        Certificate.objects.exclude(short_certificate_id__isnull=True)
        .values_list("short_certificate_id", flat=True)
    )
    for certificate in Certificate.objects.all().iterator():
        certificate.short_certificate_id = _generate_short_id(existing_ids)
        certificate.save(update_fields=["short_certificate_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("certificates", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="certificate",
            name="short_certificate_id",
            field=models.CharField(blank=True, max_length=24, null=True, unique=True),
        ),
        migrations.RunPython(populate_short_certificate_ids, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="certificate",
            name="certificate_id",
        ),
        migrations.RenameField(
            model_name="certificate",
            old_name="short_certificate_id",
            new_name="certificate_id",
        ),
    ]
