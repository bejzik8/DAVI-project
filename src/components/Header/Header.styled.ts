import styled from 'styled-components';
import { Box, Container } from 'components/primitives/Layout';
import { Heading } from 'components/primitives/Typography';

export const HeaderWrapper = styled.nav`
  padding: 0.75rem 0;

  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.colors.bg1};
  z-index: 200;
  @media only screen and(min-width: 768px) {
    padding: 1.5rem 0;
  }

  border-bottom: 1px solid ${({ theme }) => theme.colors.border1};
`;

export const HeaderContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  color: ${({ theme }) => theme.colors.text};
`;

export const MenuItems = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: auto;
`;

export const ClickableHeading = styled(Heading)`
  cursor: pointer;
`;
