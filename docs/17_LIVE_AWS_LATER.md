# Live AWS Mode — Future Contract

Live AWS Mode is intentionally not the current implementation target.

## Future connection

User creates a connection → provides/creates IAM role → NairaGuard assumes role using STS → provider fetches AWS data → normalize → store → dashboard.

## Expected AWS data sources

### Cost Explorer
Cost/spend information.

### Cost Optimization Hub
Aggregated optimization recommendations.

### Compute Optimizer
Resource-level optimization recommendations and utilization-related evidence.

AWS documents Compute Optimizer recommendation categories across resources such as EC2, Auto Scaling groups, EBS, Lambda, ECS, RDS/Aurora and others. citeturn0search9

## Important limitations

AWS data may be delayed.

Compute Optimizer recommendations depend on available historical usage data.

Do not design the UI around an assumption that every connected account immediately has recommendations.

## Cost Explorer cost control

Cost Explorer API calls can incur AWS charges, so the live implementation must cache/batch/schedule data retrieval rather than repeatedly querying on every page render.

## Live provider error categories

Normalize into NairaGuard errors:

- AWS_ACCESS_DENIED
- AWS_ROLE_INVALID
- AWS_ACCOUNT_UNAVAILABLE
- AWS_THROTTLED
- AWS_SERVICE_UNAVAILABLE
- AWS_NO_DATA
- AWS_FEATURE_NOT_ENABLED
- AWS_RECOMMENDATIONS_NOT_READY
