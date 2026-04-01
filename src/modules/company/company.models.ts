// ─── Company ──────────────────────────────────────────────────────────────────

export interface CreateCompanyInput {
  name: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface CreateUserInput {
  companyId: string;
  username: string;
  email: string;
  password: string;
}

// ─── Department ───────────────────────────────────────────────────────────────

export interface CreateDepartmentInput {
  companyId: string;
  name: string;
  parentId?: string;
}

// ─── Department membership ────────────────────────────────────────────────────

export interface AddDepartmentMemberInput {
  companyId: string;
  departmentId: string;
  userId: string;
}
