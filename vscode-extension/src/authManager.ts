import * as vscode from 'vscode';
import { Organization, LoginResponse } from './types';

const SECRET_JWT_KEY = 'beetask.jwt';
const SECRET_REFRESH_KEY = 'beetask.refreshToken';
const STATE_USER_KEY = 'beetask.user';
const STATE_ORGS_KEY = 'beetask.organizations';
const STATE_ACTIVE_ORG_KEY = 'beetask.activeOrgId';

export class AuthManager {
  private secrets: vscode.SecretStorage;
  private state: vscode.Memento;

  constructor(context: vscode.ExtensionContext) {
    this.secrets = context.secrets;
    this.state = context.globalState;
  }

  public async saveAuth(loginData: LoginResponse): Promise<void> {
    await this.secrets.store(SECRET_JWT_KEY, loginData.jwt);
    if (loginData.refreshToken) {
      await this.secrets.store(SECRET_REFRESH_KEY, loginData.refreshToken);
    }
    await this.state.update(STATE_USER_KEY, {
      name: loginData.name,
      email: loginData.email,
      photo: loginData.photo,
    });
    if (loginData.organizations && loginData.organizations.length > 0) {
      await this.state.update(STATE_ORGS_KEY, loginData.organizations);
      // If no active org selected yet, default to first
      const currentOrgId = await this.getActiveOrgId();
      if (!currentOrgId || !loginData.organizations.some(o => o.id === currentOrgId)) {
        await this.setActiveOrgId(loginData.organizations[0].id);
      }
    }
  }

  public async getJwt(): Promise<string | undefined> {
    return await this.secrets.get(SECRET_JWT_KEY);
  }

  public async getRefreshToken(): Promise<string | undefined> {
    return await this.secrets.get(SECRET_REFRESH_KEY);
  }

  public getUser(): { name: string; email: string; photo?: string } | undefined {
    return this.state.get(STATE_USER_KEY);
  }

  public getOrganizations(): Organization[] {
    return this.state.get<Organization[]>(STATE_ORGS_KEY) || [];
  }

  public getActiveOrgId(): number | undefined {
    return this.state.get<number>(STATE_ACTIVE_ORG_KEY);
  }

  public async setActiveOrgId(orgId: number): Promise<void> {
    await this.state.update(STATE_ACTIVE_ORG_KEY, orgId);
  }

  public async clearAuth(): Promise<void> {
    await this.secrets.delete(SECRET_JWT_KEY);
    await this.secrets.delete(SECRET_REFRESH_KEY);
    await this.state.update(STATE_USER_KEY, undefined);
    await this.state.update(STATE_ORGS_KEY, undefined);
    await this.state.update(STATE_ACTIVE_ORG_KEY, undefined);
  }

  public async isAuthenticated(): Promise<boolean> {
    const jwt = await this.getJwt();
    return !!jwt;
  }

  public getActiveOrgName(): string {
    const activeId = this.getActiveOrgId();
    if (!activeId) return '';
    const orgs = this.getOrganizations();
    const found = orgs.find(o => o.id === activeId);
    return found ? found.name : '';
  }
}
