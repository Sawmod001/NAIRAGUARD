import { z } from "zod";

/**
 * AWS schemas — NG-AWS-04
 * Role ARN entry validated before business logic per NG-006.
 * Shape check only; STS verification (NG-AWS-03) proves the role is assumable.
 */

export const roleArnSchema = z.object({
  roleArn: z
    .string()
    .trim()
    .min(1, "Role ARN is required")
    .max(2048)
    .regex(/^arn:aws:iam::\d{12}:role\/[\w+=,.@/-]+$/, "Must look like arn:aws:iam::123456789012:role/Name"),
});

export type RoleArnInput = z.infer<typeof roleArnSchema>;
