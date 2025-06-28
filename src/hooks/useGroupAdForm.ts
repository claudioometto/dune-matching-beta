import { useState, useEffect } from 'react';
import { GroupAdData, GroupAdErrors } from '../types/group';
import { groupService } from '../services/groupService';
import { useAuth } from '../components/auth/AuthProvider';

const initialFormData: GroupAdData = {
  groupName: '',
  objective: '',
  roles: [
    { id: '1', type: 'Coleta', isOwner: true, playerName: 'Você (Anunciante)' },
    { id: '2', type: 'Coleta', isOwner: false },
    { id: '3', type: 'Coleta', isOwner: false },
    { id: '4', type: 'Coleta', isOwner: false }
  ],
  filters: {
    minLevel: '',
    interests: [],
    minWeaponTier: '',
    minArmorTier: '',
    minOrnithopterTier: '',
    requiresDeepDesertBase: false,
    specificSector: '',
    requiredTools: []
  }
};

export const useGroupAdForm = () => {
  const [formData, setFormData] = useState<GroupAdData>(initialFormData);
  const [errors, setErrors] = useState<GroupAdErrors>({});
  const [loading, setLoading] = useState(false);
  const [hasActiveGroup, setHasActiveGroup] = useState(false);
  const [checkingActiveGroup, setCheckingActiveGroup] = useState(true);
  const { user } = useAuth();

  // Verificar se o usuário já tem um grupo ativo
  const checkActiveGroup = async () => {
    if (!user?.id) {
      setCheckingActiveGroup(false);
      return;
    }

    try {
      const { data: userGroups, error } = await groupService.getUserGroups(user.id);
      
      if (error) {
        console.error('Erro ao verificar grupos ativos:', error);
        setHasActiveGroup(false);
      } else {
        const activeGroups = userGroups?.filter(group => group.status === 'open') || [];
        setHasActiveGroup(activeGroups.length > 0);
      }
    } catch (error) {
      console.error('Erro ao verificar grupos ativos:', error);
      setHasActiveGroup(false);
    } finally {
      setCheckingActiveGroup(false);
    }
  };

  // Verificar grupos ativos quando o componente carrega
  useEffect(() => {
    checkActiveGroup();
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('filters.')) {
      const filterField = field.replace('filters.', '');
      setFormData(prev => ({
        ...prev,
        filters: { ...prev.filters, [filterField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (roleId: string, newType: 'Coleta' | 'Ataque') => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map(role => 
        role.id === roleId ? { ...role, type: newType } : role
      )
    }));
  };

  const handleFilterInterestToggle = (interest: string) => {
    const newInterests = formData.filters.interests.includes(interest)
      ? formData.filters.interests.filter(i => i !== interest)
      : [...formData.filters.interests, interest];
    
    handleInputChange('filters.interests', newInterests);
  };

  const handleFilterToolToggle = (tool: string) => {
    const newTools = formData.filters.requiredTools.includes(tool)
      ? formData.filters.requiredTools.filter(t => t !== tool)
      : [...formData.filters.requiredTools, tool];
    
    handleInputChange('filters.requiredTools', newTools);
  };

  const validateForm = (): boolean => {
    const newErrors: GroupAdErrors = {};

    if (!formData.groupName.trim()) {
      newErrors.groupName = 'Nome do grupo é obrigatório';
    }

    if (!formData.objective) {
      newErrors.objective = 'Objetivo do grupo é obrigatório';
    }

    // Check if at least one role is defined (owner is always defined)
    const definedRoles = formData.roles.filter(role => role.type);
    if (definedRoles.length === 0) {
      newErrors.roles = 'Defina pelo menos uma função no grupo';
    }

    // Validate conditional fields
    if (formData.filters.requiresDeepDesertBase && !formData.filters.specificSector) {
      newErrors['filters.specificSector'] = 'Setor específico é obrigatório quando base no Deep Desert é exigida';
    }

    // Level validation - Ajustado para 1-200
    if (formData.filters.minLevel) {
      const level = parseInt(formData.filters.minLevel);
      if (isNaN(level) || level < 1 || level > 200) {
        newErrors['filters.minLevel'] = 'Level deve ser entre 1 e 200';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se já tem grupo ativo
    if (hasActiveGroup) {
      alert('❌ Você já possui um grupo ativo. Finalize-o antes de criar outro.');
      return;
    }
    
    if (!validateForm()) return;
    if (!user?.id) {
      alert('❌ Erro: Usuário não autenticado');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await groupService.createGroupAd(formData, user.id);
      
      if (error) {
        console.error('Erro ao criar anúncio:', error);
        alert('❌ Erro ao publicar anúncio: ' + error.message);
        return;
      }
      
      console.log('✅ Anúncio criado no Supabase:', data);
      alert('⚔️ Aliança formada com sucesso! Guerreiros compatíveis receberão convites.');
      
      // Reset form
      setFormData(initialFormData);
      setHasActiveGroup(true); // Marcar que agora tem grupo ativo
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('❌ Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    hasActiveGroup,
    checkingActiveGroup,
    handleInputChange,
    handleRoleChange,
    handleFilterInterestToggle,
    handleFilterToolToggle,
    handleSubmit,
    checkActiveGroup
  };
};