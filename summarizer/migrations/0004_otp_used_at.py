from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("summarizer", "0003_otp")]
    operations = [
        migrations.AddField(model_name="otp", name="used_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AlterField(model_name="otp", name="email", field=models.EmailField(db_index=True, max_length=254)),
        migrations.AlterField(model_name="otp", name="otp", field=models.CharField(max_length=128)),
        migrations.AlterModelOptions(name="otp", options={"ordering": ["-created_at"]}),
    ]
